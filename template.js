/**
 * Fortune Teller Template Renderer
 * Correct geometry based on standard origami fortune teller
 *
 * Structure:
 * - 4 corner squares (where colors go)
 * - 8 outer triangles (where numbers go)
 * - 4 inner triangles (where fortunes go, the center diamond)
 *
 * Lines from center go to:
 * - 4 outer corners
 * - 4 edge midpoints
 * - 4 inner corners of corner squares
 */

class FortuneTellerTemplate {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.size = 600;
        this.canvas.width = this.size;
        this.canvas.height = this.size;

        this.mode = 'both';
        this.assignments = {};

        this.defineSections();
    }

    defineSections() {
        const s = this.size;
        const h = s / 2;           // Half - center point
        const c = s / 4;           // Corner square size

        // Key points
        const center = { x: h, y: h };

        // Outer corners
        const TL = { x: 0, y: 0 };
        const TR = { x: s, y: 0 };
        const BL = { x: 0, y: s };
        const BR = { x: s, y: s };

        // Edge midpoints
        const T = { x: h, y: 0 };
        const B = { x: h, y: s };
        const L = { x: 0, y: h };
        const R = { x: s, y: h };

        // Inner corners of corner squares
        const TLi = { x: c, y: c };
        const TRi = { x: s - c, y: c };
        const BLi = { x: c, y: s - c };
        const BRi = { x: s - c, y: s - c };

        // Corner squares (4) - where colors/main images go
        this.cornerSections = [
            {
                id: 'corner1',
                label: 'A',
                type: 'square',
                vertices: [TL, { x: c, y: 0 }, TLi, { x: 0, y: c }],
                center: { x: c / 2, y: c / 2 },
                rotation: Math.PI  // Upside down when folded
            },
            {
                id: 'corner2',
                label: 'B',
                type: 'square',
                vertices: [{ x: s - c, y: 0 }, TR, { x: s, y: c }, TRi],
                center: { x: s - c / 2, y: c / 2 },
                rotation: Math.PI
            },
            {
                id: 'corner3',
                label: 'C',
                type: 'square',
                vertices: [{ x: 0, y: s - c }, BLi, { x: c, y: s }, BL],
                center: { x: c / 2, y: s - c / 2 },
                rotation: 0
            },
            {
                id: 'corner4',
                label: 'D',
                type: 'square',
                vertices: [BRi, { x: s, y: s - c }, BR, { x: s - c, y: s }],
                center: { x: s - c / 2, y: s - c / 2 },
                rotation: 0
            }
        ];

        // Outer triangles (8) - where numbers go
        // Right triangles between corner squares and edge midpoints (NOT touching center)
        this.outerSections = [
            // Top edge - left triangle (5)
            {
                id: 'outer5',
                label: '5',
                vertices: [{ x: c, y: 0 }, T, TLi],
                center: { x: c + (h - c) / 3, y: c / 3 },
                rotation: 0
            },
            // Top edge - right triangle (8)
            {
                id: 'outer8',
                label: '8',
                vertices: [T, { x: s - c, y: 0 }, TRi],
                center: { x: s - c - (h - c) / 3, y: c / 3 },
                rotation: 0
            },
            // Left edge - top triangle (4)
            {
                id: 'outer4',
                label: '4',
                vertices: [{ x: 0, y: c }, TLi, L],
                center: { x: c / 3, y: c + (h - c) / 3 },
                rotation: Math.PI / 2
            },
            // Right edge - top triangle (3)
            {
                id: 'outer3',
                label: '3',
                vertices: [TRi, { x: s, y: c }, R],
                center: { x: s - c / 3, y: c + (h - c) / 3 },
                rotation: -Math.PI / 2
            },
            // Left edge - bottom triangle (1)
            {
                id: 'outer1',
                label: '1',
                vertices: [L, BLi, { x: 0, y: s - c }],
                center: { x: c / 3, y: s - c - (h - c) / 3 },
                rotation: Math.PI / 2
            },
            // Right edge - bottom triangle (6)
            {
                id: 'outer6',
                label: '6',
                vertices: [R, { x: s, y: s - c }, BRi],
                center: { x: s - c / 3, y: s - c - (h - c) / 3 },
                rotation: -Math.PI / 2
            },
            // Bottom edge - left triangle (2)
            {
                id: 'outer2',
                label: '2',
                vertices: [BLi, { x: c, y: s }, B],
                center: { x: c + (h - c) / 3, y: s - c / 3 },
                rotation: Math.PI
            },
            // Bottom edge - right triangle (7)
            {
                id: 'outer7',
                label: '7',
                vertices: [B, { x: s - c, y: s }, BRi],
                center: { x: s - c - (h - c) / 3, y: s - c / 3 },
                rotation: Math.PI
            }
        ];

        // Inner triangles (8) - the center diamond divided into 8 triangles by diagonals
        // These are where fortunes go
        this.innerSections = [
            // Top-left inner triangle
            {
                id: 'inner1',
                label: 'F1',
                vertices: [T, center, TLi],
                center: { x: h - (h - c) / 3, y: c + (h - c) / 3 },
                rotation: -Math.PI / 4
            },
            // Top-right inner triangle
            {
                id: 'inner2',
                label: 'F2',
                vertices: [T, TRi, center],
                center: { x: h + (h - c) / 3, y: c + (h - c) / 3 },
                rotation: Math.PI / 4
            },
            // Right-top inner triangle
            {
                id: 'inner3',
                label: 'F3',
                vertices: [TRi, R, center],
                center: { x: s - c - (h - c) / 3, y: h - (h - c) / 3 },
                rotation: -Math.PI / 4
            },
            // Right-bottom inner triangle
            {
                id: 'inner4',
                label: 'F4',
                vertices: [R, BRi, center],
                center: { x: s - c - (h - c) / 3, y: h + (h - c) / 3 },
                rotation: Math.PI / 4
            },
            // Bottom-right inner triangle
            {
                id: 'inner5',
                label: 'F5',
                vertices: [BRi, B, center],
                center: { x: h + (h - c) / 3, y: s - c - (h - c) / 3 },
                rotation: -Math.PI / 4
            },
            // Bottom-left inner triangle
            {
                id: 'inner6',
                label: 'F6',
                vertices: [B, BLi, center],
                center: { x: h - (h - c) / 3, y: s - c - (h - c) / 3 },
                rotation: Math.PI / 4
            },
            // Left-bottom inner triangle
            {
                id: 'inner7',
                label: 'F7',
                vertices: [BLi, L, center],
                center: { x: c + (h - c) / 3, y: h + (h - c) / 3 },
                rotation: -Math.PI / 4
            },
            // Left-top inner triangle
            {
                id: 'inner8',
                label: 'F8',
                vertices: [L, TLi, center],
                center: { x: c + (h - c) / 3, y: h - (h - c) / 3 },
                rotation: Math.PI / 4
            }
        ];
    }

    setMode(mode) {
        this.mode = mode;
        this.render();
    }

    setAssignment(sectionId, selectionData) {
        this.assignments[sectionId] = selectionData;
        this.render();
    }

    clearAssignment(sectionId) {
        delete this.assignments[sectionId];
        this.render();
    }

    clearAllAssignments() {
        this.assignments = {};
        this.render();
    }

    render() {
        const ctx = this.ctx;
        const s = this.size;
        const h = s / 2;
        const c = s / 4;

        // Clear canvas with white
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, s, s);

        // Render sections based on mode
        if (this.mode === 'numbers') {
            this.renderNumbersOnly();
        } else {
            if (this.mode === 'both' || this.mode === 'corners' || this.mode === 'outer') {
                this.renderSections(this.cornerSections, 'corner');
            }
            if (this.mode === 'both' || this.mode === 'outer') {
                this.renderSections(this.outerSections, 'outer');
            }
            if (this.mode === 'both' || this.mode === 'inner') {
                this.renderSections(this.innerSections, 'inner');
            }
        }

        // Draw the fold lines and structure
        this.drawStructureLines();
    }

    drawStructureLines() {
        const ctx = this.ctx;
        const s = this.size;
        const h = s / 2;
        const c = s / 4;

        // Dashed lines (fold lines)
        ctx.setLineDash([8, 4]);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;

        // Outer border
        ctx.strokeRect(1, 1, s - 2, s - 2);

        // Center horizontal and vertical
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(s, h);
        ctx.moveTo(h, 0);
        ctx.lineTo(h, s);
        ctx.stroke();

        // Solid lines (cut/fold structure)
        ctx.setLineDash([]);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1.5;

        // Corner square boundaries (L-shapes at each corner)
        ctx.beginPath();
        // Top-left
        ctx.moveTo(c, 0);
        ctx.lineTo(c, c);
        ctx.lineTo(0, c);
        // Top-right
        ctx.moveTo(s - c, 0);
        ctx.lineTo(s - c, c);
        ctx.lineTo(s, c);
        // Bottom-left
        ctx.moveTo(0, s - c);
        ctx.lineTo(c, s - c);
        ctx.lineTo(c, s);
        // Bottom-right
        ctx.moveTo(s, s - c);
        ctx.lineTo(s - c, s - c);
        ctx.lineTo(s - c, s);
        ctx.stroke();

        // Lines from center to key points
        ctx.beginPath();

        // To edge midpoints
        ctx.moveTo(h, h); ctx.lineTo(h, 0);
        ctx.moveTo(h, h); ctx.lineTo(h, s);
        ctx.moveTo(h, h); ctx.lineTo(0, h);
        ctx.moveTo(h, h); ctx.lineTo(s, h);

        // To inner corners of corner squares (diagonals stop at corner squares, not outer edge)
        ctx.moveTo(h, h); ctx.lineTo(c, c);
        ctx.moveTo(h, h); ctx.lineTo(s - c, c);
        ctx.moveTo(h, h); ctx.lineTo(c, s - c);
        ctx.moveTo(h, h); ctx.lineTo(s - c, s - c);

        ctx.stroke();
    }

    renderSections(sections, type) {
        for (const section of sections) {
            this.renderSection(section, type);
        }
    }

    renderSection(section, type) {
        const ctx = this.ctx;
        const assignment = this.assignments[section.id];
        const isSquare = section.type === 'square';

        // Create path for the shape
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(section.vertices[0].x, section.vertices[0].y);
        for (let i = 1; i < section.vertices.length; i++) {
            ctx.lineTo(section.vertices[i].x, section.vertices[i].y);
        }
        ctx.closePath();

        if (assignment && assignment.canvas) {
            ctx.clip();
            this.drawImageInSection(assignment.canvas, section, isSquare);
            ctx.restore();
        } else {
            // No assignment - show placeholder
            const colors = {
                corner: '#f0f0f0',
                outer: '#f8f8f8',
                inner: '#fafafa'
            };
            ctx.fillStyle = colors[type] || '#f5f5f5';
            ctx.fill();
            ctx.restore();

            // Draw label with rotation
            ctx.save();
            ctx.translate(section.center.x, section.center.y);
            ctx.rotate(section.rotation);
            ctx.fillStyle = '#bbb';
            ctx.font = type === 'corner' ? 'bold 28px Arial' : (type === 'inner' ? '18px Arial' : 'bold 32px Arial');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(section.label, 0, 0);
            ctx.restore();
        }
    }

    drawImageInSection(sourceCanvas, section, isSquare) {
        const ctx = this.ctx;

        // Calculate bounding box for sizing
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        for (const v of section.vertices) {
            minX = Math.min(minX, v.x);
            minY = Math.min(minY, v.y);
            maxX = Math.max(maxX, v.x);
            maxY = Math.max(maxY, v.y);
        }

        const sectionWidth = maxX - minX;
        const sectionHeight = maxY - minY;

        // Calculate centroid of the polygon for proper centering
        let centroidX = 0, centroidY = 0;
        for (const v of section.vertices) {
            centroidX += v.x;
            centroidY += v.y;
        }
        centroidX /= section.vertices.length;
        centroidY /= section.vertices.length;

        const imgWidth = sourceCanvas.width;
        const imgHeight = sourceCanvas.height;

        // Use Math.min to fit image WITHIN section (not overflow)
        // Smaller factor for triangles since they have less usable area
        const fitFactor = isSquare ? 0.85 : 0.5;
        const scale = Math.min(sectionWidth / imgWidth, sectionHeight / imgHeight) * fitFactor;

        const drawWidth = imgWidth * scale;
        const drawHeight = imgHeight * scale;

        ctx.translate(centroidX, centroidY);
        ctx.rotate(section.rotation);
        ctx.drawImage(
            sourceCanvas,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight
        );
    }

    renderNumbersOnly() {
        const ctx = this.ctx;
        const s = this.size;
        const h = s / 2;
        const c = s / 4;

        // Draw corner squares with colors
        const colors = ['#FFEB3B', '#4CAF50', '#2196F3', '#F44336'];
        const colorNames = ['Yellow', 'Green', 'Blue', 'Red'];

        for (let i = 0; i < this.cornerSections.length; i++) {
            const section = this.cornerSections[i];
            ctx.beginPath();
            ctx.moveTo(section.vertices[0].x, section.vertices[0].y);
            for (let j = 1; j < section.vertices.length; j++) {
                ctx.lineTo(section.vertices[j].x, section.vertices[j].y);
            }
            ctx.closePath();
            ctx.fillStyle = colors[i];
            ctx.fill();

            ctx.save();
            ctx.translate(section.center.x, section.center.y);
            ctx.rotate(section.rotation);
            ctx.fillStyle = '#000';
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(colorNames[i], 0, 0);
            ctx.restore();
        }

        // Draw numbered outer sections
        for (const section of this.outerSections) {
            ctx.beginPath();
            ctx.moveTo(section.vertices[0].x, section.vertices[0].y);
            for (let i = 1; i < section.vertices.length; i++) {
                ctx.lineTo(section.vertices[i].x, section.vertices[i].y);
            }
            ctx.closePath();
            ctx.fillStyle = '#fff';
            ctx.fill();

            ctx.save();
            ctx.translate(section.center.x, section.center.y);
            ctx.rotate(section.rotation);
            ctx.fillStyle = '#333';
            ctx.font = 'bold 36px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(section.label, 0, 0);
            ctx.restore();
        }

        // Draw inner fortune sections (8 triangles)
        const fortunes = [
            'Great things await.',
            'Many friends ahead.',
            'Success is yours.',
            'Love surrounds you.',
            'Adventure calls.',
            'Wisdom grows.',
            'Joy follows.',
            'Dreams come true.'
        ];

        for (let i = 0; i < this.innerSections.length; i++) {
            const section = this.innerSections[i];
            ctx.beginPath();
            ctx.moveTo(section.vertices[0].x, section.vertices[0].y);
            for (let j = 1; j < section.vertices.length; j++) {
                ctx.lineTo(section.vertices[j].x, section.vertices[j].y);
            }
            ctx.closePath();
            ctx.fillStyle = '#fff';
            ctx.fill();

            ctx.save();
            ctx.translate(section.center.x, section.center.y);
            ctx.rotate(section.rotation);
            ctx.fillStyle = '#666';
            ctx.font = '9px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Wrap text for smaller triangles
            const words = fortunes[i].split(' ');
            let line = '';
            let y = -8;
            const lineHeight = 11;
            const maxWidth = 50;

            for (const word of words) {
                const testLine = line + word + ' ';
                if (ctx.measureText(testLine).width > maxWidth && line !== '') {
                    ctx.fillText(line.trim(), 0, y);
                    line = word + ' ';
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line.trim(), 0, y);
            ctx.restore();
        }
    }

    getAvailableSections() {
        if (this.mode === 'numbers') {
            return [];
        }

        const sections = [];

        if (this.mode === 'both' || this.mode === 'outer' || this.mode === 'corners') {
            for (const s of this.cornerSections) {
                sections.push({
                    id: s.id,
                    label: `Corner ${s.label}`,
                    type: 'corner'
                });
            }
        }

        if (this.mode === 'both' || this.mode === 'outer') {
            for (const s of this.outerSections) {
                sections.push({
                    id: s.id,
                    label: `Number ${s.label}`,
                    type: 'outer'
                });
            }
        }

        if (this.mode === 'both' || this.mode === 'inner') {
            for (const s of this.innerSections) {
                sections.push({
                    id: s.id,
                    label: `Fortune ${s.label}`,
                    type: 'inner'
                });
            }
        }

        return sections;
    }

    toDataURL() {
        return this.canvas.toDataURL('image/png');
    }

    renderForPrint(printCanvas) {
        const pageWidth = 816;
        const pageHeight = 1056;
        const templateSize = 672;

        printCanvas.width = pageWidth;
        printCanvas.height = pageHeight;

        const printCtx = printCanvas.getContext('2d');
        printCtx.fillStyle = 'white';
        printCtx.fillRect(0, 0, pageWidth, pageHeight);

        const offsetX = (pageWidth - templateSize) / 2;
        const offsetY = (pageHeight - templateSize) / 2;

        const oldSize = this.size;
        this.size = templateSize;
        this.defineSections();

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = templateSize;
        tempCanvas.height = templateSize;

        const oldCtx = this.ctx;
        const oldCanvas = this.canvas;
        this.ctx = tempCanvas.getContext('2d');
        this.canvas = tempCanvas;

        this.render();

        printCtx.drawImage(tempCanvas, offsetX, offsetY);

        this.ctx = oldCtx;
        this.canvas = oldCanvas;
        this.size = oldSize;
        this.defineSections();
    }

    // Point-in-polygon test using ray casting algorithm
    pointInPolygon(point, vertices) {
        let inside = false;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const xi = vertices[i].x, yi = vertices[i].y;
            const xj = vertices[j].x, yj = vertices[j].y;

            if (((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
                inside = !inside;
            }
        }
        return inside;
    }

    // Find which section contains the given point
    getSectionAtPoint(x, y) {
        const point = { x, y };

        // Check based on current mode
        const allSections = [];

        if (this.mode === 'both' || this.mode === 'corners' || this.mode === 'outer') {
            allSections.push(...this.cornerSections.map(s => ({ ...s, type: 'corner' })));
        }
        if (this.mode === 'both' || this.mode === 'outer') {
            allSections.push(...this.outerSections.map(s => ({ ...s, type: 'outer' })));
        }
        if (this.mode === 'both' || this.mode === 'inner') {
            allSections.push(...this.innerSections.map(s => ({ ...s, type: 'inner' })));
        }

        for (const section of allSections) {
            if (this.pointInPolygon(point, section.vertices)) {
                return {
                    id: section.id,
                    label: section.label,
                    type: section.type
                };
            }
        }

        return null;
    }

    // Highlight a section during drag-over
    highlightSectionAt(x, y) {
        const section = this.getSectionAtPoint(x, y);

        if (section && section.id !== this.highlightedSectionId) {
            this.highlightedSectionId = section.id;
            this.renderWithHighlight(section.id);
        } else if (!section && this.highlightedSectionId) {
            this.clearHighlight();
        }
    }

    // Clear any section highlighting
    clearHighlight() {
        if (this.highlightedSectionId) {
            this.highlightedSectionId = null;
            this.render();
        }
    }

    // Render with a specific section highlighted
    renderWithHighlight(sectionId) {
        // First do normal render
        this.render();

        // Then draw highlight overlay on the section
        const allSections = [
            ...this.cornerSections,
            ...this.outerSections,
            ...this.innerSections
        ];

        const section = allSections.find(s => s.id === sectionId);
        if (!section) return;

        const ctx = this.ctx;
        ctx.save();

        // Draw highlight
        ctx.beginPath();
        ctx.moveTo(section.vertices[0].x, section.vertices[0].y);
        for (let i = 1; i < section.vertices.length; i++) {
            ctx.lineTo(section.vertices[i].x, section.vertices[i].y);
        }
        ctx.closePath();

        ctx.fillStyle = 'rgba(74, 105, 189, 0.3)';
        ctx.fill();

        ctx.strokeStyle = '#4a69bd';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();
    }
}

window.FortuneTellerTemplate = FortuneTellerTemplate;
