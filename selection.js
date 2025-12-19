/**
 * Polygon Selection Tool
 * Handles free-form polygon selection on canvas
 */

class PolygonSelector {
    constructor(canvas, sourceCanvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.sourceCanvas = sourceCanvas;
        this.sourceCtx = sourceCanvas.getContext('2d');

        this.isDrawing = false;
        this.points = [];
        this.currentMousePos = null;
        this.closeThreshold = 15; // pixels to auto-close polygon

        this.onSelectionComplete = null;
        this.onSelectionCancel = null;

        this.bindEvents();
    }

    bindEvents() {
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        this.canvas.addEventListener('contextmenu', this.handleRightClick.bind(this));
    }

    startSelection() {
        this.isDrawing = true;
        this.points = [];
        this.currentMousePos = null;
        this.canvas.style.cursor = 'crosshair';
        this.redraw();
    }

    cancelSelection() {
        this.isDrawing = false;
        this.points = [];
        this.currentMousePos = null;
        this.canvas.style.cursor = 'default';
        this.redraw();

        if (this.onSelectionCancel) {
            this.onSelectionCancel();
        }
    }

    finishSelection() {
        if (this.points.length < 3) {
            alert('Please add at least 3 points to create a selection');
            return false;
        }

        this.isDrawing = false;
        this.canvas.style.cursor = 'default';

        const selection = {
            points: [...this.points],
            bounds: this.getBounds(this.points)
        };

        this.points = [];
        this.currentMousePos = null;
        this.redraw();

        if (this.onSelectionComplete) {
            this.onSelectionComplete(selection);
        }

        return true;
    }

    handleClick(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if clicking near first point to close
        if (this.points.length >= 3) {
            const first = this.points[0];
            const dist = Math.sqrt(Math.pow(x - first.x, 2) + Math.pow(y - first.y, 2));
            if (dist < this.closeThreshold) {
                this.finishSelection();
                return;
            }
        }

        this.points.push({ x, y });
        this.redraw();
    }

    handleMouseMove(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        this.currentMousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        this.redraw();
    }

    handleDoubleClick(e) {
        if (this.isDrawing && this.points.length >= 3) {
            // Remove the point added by the first click of the double-click
            this.points.pop();
            this.finishSelection();
        }
    }

    handleRightClick(e) {
        e.preventDefault();
        if (this.isDrawing && this.points.length > 0) {
            // Undo last point
            this.points.pop();
            this.redraw();
        }
    }

    redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.isDrawing && this.points.length === 0) return;

        // Draw filled polygon with semi-transparent fill
        if (this.points.length > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.points[0].x, this.points[0].y);

            for (let i = 1; i < this.points.length; i++) {
                this.ctx.lineTo(this.points[i].x, this.points[i].y);
            }

            // If drawing, show line to current mouse position
            if (this.isDrawing && this.currentMousePos) {
                this.ctx.lineTo(this.currentMousePos.x, this.currentMousePos.y);
            }

            // Fill
            this.ctx.fillStyle = 'rgba(74, 105, 189, 0.3)';
            this.ctx.fill();

            // Stroke
            this.ctx.strokeStyle = '#4a69bd';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        // Draw points
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            const isFirst = i === 0;

            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, isFirst ? 8 : 5, 0, Math.PI * 2);
            this.ctx.fillStyle = isFirst ? '#e74c3c' : '#4a69bd';
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        // Draw close indicator if near first point
        if (this.isDrawing && this.points.length >= 3 && this.currentMousePos) {
            const first = this.points[0];
            const dist = Math.sqrt(
                Math.pow(this.currentMousePos.x - first.x, 2) +
                Math.pow(this.currentMousePos.y - first.y, 2)
            );

            if (dist < this.closeThreshold) {
                this.ctx.beginPath();
                this.ctx.arc(first.x, first.y, this.closeThreshold, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(231, 76, 60, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        }
    }

    getBounds(points) {
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (const p of points) {
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        }

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    /**
     * Extract the selected region as a canvas
     * @param {HTMLImageElement} sourceImage - The source image
     * @param {Object} selection - The selection object with points and bounds
     * @returns {HTMLCanvasElement} - Canvas with the clipped region
     */
    extractSelection(sourceImage, selection) {
        const { points, bounds } = selection;

        // Create a canvas for the extracted region
        const extractCanvas = document.createElement('canvas');
        extractCanvas.width = bounds.width;
        extractCanvas.height = bounds.height;
        const extractCtx = extractCanvas.getContext('2d');

        // Translate points relative to bounds
        const relativePoints = points.map(p => ({
            x: p.x - bounds.x,
            y: p.y - bounds.y
        }));

        // Create clipping path
        extractCtx.beginPath();
        extractCtx.moveTo(relativePoints[0].x, relativePoints[0].y);
        for (let i = 1; i < relativePoints.length; i++) {
            extractCtx.lineTo(relativePoints[i].x, relativePoints[i].y);
        }
        extractCtx.closePath();
        extractCtx.clip();

        // Draw the source image, offset by bounds
        extractCtx.drawImage(
            sourceImage,
            bounds.x, bounds.y, bounds.width, bounds.height,
            0, 0, bounds.width, bounds.height
        );

        return extractCanvas;
    }

    /**
     * Create a preview thumbnail of the selection
     * @param {HTMLImageElement} sourceImage
     * @param {Object} selection
     * @param {number} size - Thumbnail size
     * @returns {HTMLCanvasElement}
     */
    createThumbnail(sourceImage, selection, size = 50) {
        const extracted = this.extractSelection(sourceImage, selection);

        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = size;
        thumbCanvas.height = size;
        const thumbCtx = thumbCanvas.getContext('2d');

        // Calculate scaling to fit
        const scale = Math.min(size / extracted.width, size / extracted.height);
        const scaledWidth = extracted.width * scale;
        const scaledHeight = extracted.height * scale;
        const offsetX = (size - scaledWidth) / 2;
        const offsetY = (size - scaledHeight) / 2;

        thumbCtx.fillStyle = '#2d3a5a';
        thumbCtx.fillRect(0, 0, size, size);
        thumbCtx.drawImage(extracted, offsetX, offsetY, scaledWidth, scaledHeight);

        return thumbCanvas;
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.redraw();
    }

    clear() {
        this.points = [];
        this.isDrawing = false;
        this.currentMousePos = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Export for use in app.js
window.PolygonSelector = PolygonSelector;
