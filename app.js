/**
 * Fortune Teller Maker - Main Application
 * Enhanced UI with drag-and-drop assignment
 */

class FortuneTellerApp {
    constructor() {
        // State
        this.images = []; // Array of { id, name, element: HTMLImageElement }
        this.currentImageIndex = -1;
        this.selections = []; // Array of { id, name, imageId, selection, canvas }
        this.selectionCounter = 0;
        this.currentPickerSection = null; // For picker modal
        this.draggedSelectionId = null; // For drag-drop

        // DOM Elements
        this.sourceCanvas = document.getElementById('sourceCanvas');
        this.selectionCanvas = document.getElementById('selectionCanvas');
        this.templateCanvas = document.getElementById('templateCanvas');
        this.printCanvas = document.getElementById('printCanvas');
        this.sourceContainer = document.getElementById('sourceContainer');
        this.templateContainer = document.querySelector('.template-container');
        this.dropZone = document.getElementById('dropZone');
        this.imageInput = document.getElementById('imageInput');
        this.thumbnailsContainer = document.getElementById('thumbnails');
        this.selectionsListEl = document.getElementById('selectionsList');
        this.assignmentGrid = document.getElementById('assignmentGrid');
        this.modeSelect = document.getElementById('modeSelect');
        this.instructionsEl = document.getElementById('selectionInstructions');

        // Buttons
        this.newSelectionBtn = document.getElementById('newSelectionBtn');
        this.finishSelectionBtn = document.getElementById('finishSelectionBtn');
        this.cancelSelectionBtn = document.getElementById('cancelSelectionBtn');
        this.autoSegmentBtn = document.getElementById('autoSegmentBtn');
        this.printBtn = document.getElementById('printBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.quickFillBtn = document.getElementById('quickFillBtn');

        // Segment options
        this.segmentOptions = document.getElementById('segmentOptions');
        this.bgTypeSelect = document.getElementById('bgTypeSelect');
        this.thresholdSlider = document.getElementById('thresholdSlider');
        this.thresholdValue = document.getElementById('thresholdValue');
        this.customColorLabel = document.getElementById('customColorLabel');
        this.customColorPicker = document.getElementById('customColorPicker');
        this.gridSizeLabel = document.getElementById('gridSizeLabel');
        this.gridSizeInput = document.getElementById('gridSizeInput');
        this.minSizeSlider = document.getElementById('minSizeSlider');
        this.minSizeValue = document.getElementById('minSizeValue');
        this.runSegmentBtn = document.getElementById('runSegmentBtn');
        this.cancelSegmentBtn = document.getElementById('cancelSegmentBtn');

        // Picker modal
        this.selectionPicker = document.getElementById('selectionPicker');
        this.pickerTitle = document.getElementById('pickerTitle');
        this.pickerGrid = document.getElementById('pickerGrid');
        this.pickerClose = document.getElementById('pickerClose');
        this.pickerClear = document.getElementById('pickerClear');

        // Initialize components
        this.sourceCtx = this.sourceCanvas.getContext('2d');
        this.selector = new PolygonSelector(this.selectionCanvas, this.sourceCanvas);
        this.template = new FortuneTellerTemplate(this.templateCanvas);

        // Bind events
        this.bindEvents();
        this.setupTemplateDragDrop();
        this.setupPickerModal();

        // Initial render
        this.template.render();
        this.updateAssignmentPanel();
    }

    bindEvents() {
        // Image upload
        this.imageInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files));

        // Drag and drop for images
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('drag-over');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('drag-over');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
            this.handleFileSelect(e.dataTransfer.files);
        });

        // Selection controls
        this.newSelectionBtn.addEventListener('click', () => this.startNewSelection());
        this.finishSelectionBtn.addEventListener('click', () => this.finishSelection());
        this.cancelSelectionBtn.addEventListener('click', () => this.cancelSelection());

        // Selection callbacks
        this.selector.onSelectionComplete = (selection) => this.handleSelectionComplete(selection);
        this.selector.onSelectionCancel = () => this.updateButtonStates();

        // Mode selector
        this.modeSelect.addEventListener('change', (e) => {
            this.template.setMode(e.target.value);
            this.updateAssignmentPanel();
        });

        // Action buttons
        this.printBtn.addEventListener('click', () => this.printTemplate());
        this.downloadBtn.addEventListener('click', () => this.downloadTemplate());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());
        this.quickFillBtn.addEventListener('click', () => this.quickFillAssignments());

        // Auto segment
        this.autoSegmentBtn.addEventListener('click', () => this.showSegmentOptions());
        this.runSegmentBtn.addEventListener('click', () => this.runAutoSegment());
        this.cancelSegmentBtn.addEventListener('click', () => this.hideSegmentOptions());

        this.thresholdSlider.addEventListener('input', () => {
            this.thresholdValue.textContent = this.thresholdSlider.value;
        });
        this.minSizeSlider.addEventListener('input', () => {
            this.minSizeValue.textContent = this.minSizeSlider.value;
        });

        // Background type changes
        this.bgTypeSelect.addEventListener('change', () => this.updateSegmentOptionsUI());
    }

    updateSegmentOptionsUI() {
        const bgType = this.bgTypeSelect.value;

        // Show/hide custom color picker
        this.customColorLabel.style.display = (bgType === 'custom') ? 'flex' : 'none';

        // Show/hide grid size input
        this.gridSizeLabel.style.display = (bgType === 'grid') ? 'flex' : 'none';

        // Update threshold default and instructions based on type
        if (bgType === 'white') {
            this.thresholdSlider.value = 240;
            this.thresholdValue.textContent = '240';
            this.instructionsEl.innerHTML = '<p>Detects white/light backgrounds. Higher threshold = stricter white detection.</p>';
        } else if (bgType === 'black') {
            this.thresholdSlider.value = 30;
            this.thresholdValue.textContent = '30';
            this.instructionsEl.innerHTML = '<p>Detects black/dark backgrounds. Lower threshold = stricter black detection.</p>';
        } else if (bgType === 'transparent') {
            this.thresholdSlider.value = 128;
            this.thresholdValue.textContent = '128';
            this.instructionsEl.innerHTML = '<p>Detects transparent areas. Threshold controls alpha sensitivity.</p>';
        } else if (bgType === 'grid') {
            this.instructionsEl.innerHTML = '<p>Splits image into a uniform grid. Set grid size (e.g., 4 = 4x4 = 16 regions).</p>';
        } else if (bgType === 'custom') {
            this.instructionsEl.innerHTML = '<p>Select a background color to detect. Threshold controls color tolerance.</p>';
        }
    }

    setupTemplateDragDrop() {
        // Template canvas as drop target
        this.templateCanvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.templateContainer.classList.add('drag-over');
            this.templateCanvas.classList.add('drag-active');

            // Highlight section under cursor
            const rect = this.templateCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.template.highlightSectionAt(x, y);
        });

        this.templateCanvas.addEventListener('dragleave', (e) => {
            this.templateContainer.classList.remove('drag-over');
            this.templateCanvas.classList.remove('drag-active');
            this.template.clearHighlight();
        });

        this.templateCanvas.addEventListener('drop', (e) => {
            e.preventDefault();
            this.templateContainer.classList.remove('drag-over');
            this.templateCanvas.classList.remove('drag-active');
            this.template.clearHighlight();

            const selectionId = e.dataTransfer.getData('text/plain');
            if (!selectionId) return;

            const rect = this.templateCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const section = this.template.getSectionAtPoint(x, y);
            if (section) {
                const selection = this.selections.find(s => s.id === selectionId);
                if (selection) {
                    this.template.setAssignment(section.id, selection);
                    this.updateAssignmentPanel();
                }
            }
        });

        // Click on template to assign
        this.templateCanvas.addEventListener('click', (e) => {
            const rect = this.templateCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const section = this.template.getSectionAtPoint(x, y);
            if (section) {
                this.openPicker(section);
            }
        });
    }

    setupPickerModal() {
        this.pickerClose.addEventListener('click', () => this.closePicker());
        this.pickerClear.addEventListener('click', () => {
            if (this.currentPickerSection) {
                this.template.clearAssignment(this.currentPickerSection.id);
                this.updateAssignmentPanel();
                this.closePicker();
            }
        });

        // Close on background click
        this.selectionPicker.addEventListener('click', (e) => {
            if (e.target === this.selectionPicker) {
                this.closePicker();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.selectionPicker.style.display !== 'none') {
                this.closePicker();
            }
        });
    }

    openPicker(section) {
        this.currentPickerSection = section;
        this.pickerTitle.textContent = `Assign to ${section.label}`;
        this.pickerGrid.innerHTML = '';

        if (this.selections.length === 0) {
            this.pickerGrid.innerHTML = '<p class="picker-empty">No selections available. Create some first!</p>';
        } else {
            for (const sel of this.selections) {
                const item = document.createElement('div');
                item.className = 'picker-item';

                const canvas = document.createElement('canvas');
                canvas.width = 60;
                canvas.height = 60;
                const ctx = canvas.getContext('2d');

                // Draw thumbnail
                const scale = Math.min(60 / sel.canvas.width, 60 / sel.canvas.height);
                const w = sel.canvas.width * scale;
                const h = sel.canvas.height * scale;
                ctx.drawImage(sel.canvas, (60 - w) / 2, (60 - h) / 2, w, h);

                const name = document.createElement('div');
                name.className = 'picker-item-name';
                name.textContent = sel.name;

                item.appendChild(canvas);
                item.appendChild(name);

                item.addEventListener('click', () => {
                    this.template.setAssignment(section.id, sel);
                    this.updateAssignmentPanel();
                    this.closePicker();
                });

                this.pickerGrid.appendChild(item);
            }
        }

        this.selectionPicker.style.display = 'flex';
    }

    closePicker() {
        this.selectionPicker.style.display = 'none';
        this.currentPickerSection = null;
    }

    quickFillAssignments() {
        const sections = this.template.getAvailableSections();
        let assigned = 0;

        for (let i = 0; i < sections.length && i < this.selections.length; i++) {
            this.template.setAssignment(sections[i].id, this.selections[i]);
            assigned++;
        }

        this.updateAssignmentPanel();

        if (assigned > 0) {
            this.instructionsEl.innerHTML = `<p>Quick filled ${assigned} sections!</p>`;
        } else {
            this.instructionsEl.innerHTML = '<p>No selections available to assign.</p>';
        }
    }

    handleFileSelect(files) {
        for (const file of files) {
            if (!file.type.startsWith('image/')) continue;

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const imageData = {
                        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: file.name,
                        element: img
                    };
                    this.images.push(imageData);
                    this.addThumbnail(imageData);

                    // If this is the first image, display it
                    if (this.images.length === 1) {
                        this.displayImage(0);
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    addThumbnail(imageData) {
        const thumb = document.createElement('div');
        thumb.className = 'thumbnail';
        thumb.dataset.imageId = imageData.id;

        const img = document.createElement('img');
        img.src = imageData.element.src;
        thumb.appendChild(img);

        thumb.addEventListener('click', () => {
            const index = this.images.findIndex(i => i.id === imageData.id);
            if (index >= 0) {
                this.displayImage(index);
            }
        });

        this.thumbnailsContainer.appendChild(thumb);
    }

    displayImage(index) {
        if (index < 0 || index >= this.images.length) return;

        this.currentImageIndex = index;
        const imageData = this.images[index];
        const img = imageData.element;

        // Update canvas size to match container while maintaining aspect ratio
        const containerRect = this.sourceContainer.getBoundingClientRect();
        const maxWidth = containerRect.width - 40;
        const maxHeight = 400;

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
        }
        if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
        }

        this.sourceCanvas.width = width;
        this.sourceCanvas.height = height;
        this.selectionCanvas.width = width;
        this.selectionCanvas.height = height;

        // Draw image
        this.sourceCtx.drawImage(img, 0, 0, width, height);

        // Hide drop zone
        this.dropZone.classList.add('hidden');

        // Update thumbnail selection
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        const activeThumb = document.querySelector(`.thumbnail[data-image-id="${imageData.id}"]`);
        if (activeThumb) activeThumb.classList.add('active');

        // Enable selection button
        this.newSelectionBtn.disabled = false;

        // Store scale factor for coordinate mapping
        this.imageScaleX = img.width / width;
        this.imageScaleY = img.height / height;

        // Clear any existing selection in progress
        this.selector.clear();
        this.updateButtonStates();
    }

    startNewSelection() {
        if (this.currentImageIndex < 0) return;

        this.selector.startSelection();
        this.updateButtonStates();
        this.instructionsEl.innerHTML = '<p>Click to add points. Right-click to undo. Double-click or click near start to finish.</p>';
    }

    finishSelection() {
        this.selector.finishSelection();
    }

    cancelSelection() {
        this.selector.cancelSelection();
        this.updateButtonStates();
        this.instructionsEl.innerHTML = '<p>Click "New Selection" to start drawing a polygon region</p>';
    }

    handleSelectionComplete(selection) {
        const imageData = this.images[this.currentImageIndex];

        // Scale selection points back to original image coordinates
        const scaledSelection = {
            points: selection.points.map(p => ({
                x: p.x * this.imageScaleX,
                y: p.y * this.imageScaleY
            })),
            bounds: {
                x: selection.bounds.x * this.imageScaleX,
                y: selection.bounds.y * this.imageScaleY,
                width: selection.bounds.width * this.imageScaleX,
                height: selection.bounds.height * this.imageScaleY
            }
        };

        // Extract the selection as a canvas
        const extractedCanvas = this.selector.extractSelection(imageData.element, scaledSelection);

        // Create selection data
        this.selectionCounter++;
        const selectionData = {
            id: `sel_${Date.now()}`,
            name: `Selection ${this.selectionCounter}`,
            imageId: imageData.id,
            imageName: imageData.name,
            selection: scaledSelection,
            canvas: extractedCanvas
        };

        this.selections.push(selectionData);
        this.addSelectionToList(selectionData, imageData.element);
        this.updateAssignmentPanel();
        this.updateButtonStates();
        this.instructionsEl.innerHTML = '<p>Selection saved! Drag it to the template or click "New Selection" to add more.</p>';
    }

    addSelectionToList(selectionData, sourceImage) {
        const item = document.createElement('div');
        item.className = 'selection-item';
        item.dataset.selectionId = selectionData.id;
        item.draggable = true;
        item.title = selectionData.name;

        // Drag events
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', selectionData.id);
            e.dataTransfer.effectAllowed = 'copy';
            item.classList.add('dragging');
            this.draggedSelectionId = selectionData.id;
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            this.draggedSelectionId = null;
        });

        // Create thumbnail - larger size for grid
        const thumbCanvas = this.selector.createThumbnail(sourceImage, selectionData.selection, 70);
        const preview = document.createElement('div');
        preview.className = 'selection-preview';
        preview.appendChild(thumbCanvas);

        // Info (shown on hover)
        const info = document.createElement('div');
        info.className = 'selection-info';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'selection-name';
        nameSpan.textContent = selectionData.name;
        info.appendChild(nameSpan);

        // Actions (delete button on hover)
        const actions = document.createElement('div');
        actions.className = 'selection-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.textContent = '×';
        deleteBtn.title = 'Delete';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.deleteSelection(selectionData.id);
        });

        actions.appendChild(deleteBtn);

        item.appendChild(preview);
        item.appendChild(info);
        item.appendChild(actions);

        this.selectionsListEl.appendChild(item);
    }

    deleteSelection(selectionId) {
        // Remove from selections array
        const index = this.selections.findIndex(s => s.id === selectionId);
        if (index >= 0) {
            this.selections.splice(index, 1);
        }

        // Remove from DOM
        const item = document.querySelector(`.selection-item[data-selection-id="${selectionId}"]`);
        if (item) item.remove();

        // Clear any assignments using this selection
        for (const sectionId in this.template.assignments) {
            if (this.template.assignments[sectionId].id === selectionId) {
                this.template.clearAssignment(sectionId);
            }
        }

        this.updateAssignmentPanel();
    }

    updateButtonStates() {
        const hasImage = this.currentImageIndex >= 0;
        const isDrawing = this.selector.isDrawing;

        this.newSelectionBtn.disabled = !hasImage || isDrawing;
        this.finishSelectionBtn.disabled = !isDrawing || this.selector.points.length < 3;
        this.cancelSelectionBtn.disabled = !isDrawing;
        this.autoSegmentBtn.disabled = !hasImage || isDrawing;
    }

    updateAssignmentPanel() {
        const sections = this.template.getAvailableSections();
        this.assignmentGrid.innerHTML = '';

        if (sections.length === 0) {
            this.assignmentGrid.innerHTML = '<p style="color: #888; padding: 10px;">No sections available in this mode</p>';
            return;
        }

        // Group sections by type
        const corners = sections.filter(s => s.type === 'corner');
        const outers = sections.filter(s => s.type === 'outer');
        const inners = sections.filter(s => s.type === 'inner');

        const addGroup = (label, sectionList) => {
            if (sectionList.length === 0) return;

            const groupLabel = document.createElement('div');
            groupLabel.className = 'section-group-label';
            groupLabel.textContent = label;
            this.assignmentGrid.appendChild(groupLabel);

            for (const section of sectionList) {
                const slot = this.createAssignmentSlot(section);
                this.assignmentGrid.appendChild(slot);
            }
        };

        addGroup('Corners', corners);
        addGroup('Numbers', outers);
        addGroup('Fortunes', inners);
    }

    createAssignmentSlot(section) {
        const slot = document.createElement('div');
        slot.className = 'assignment-slot';
        slot.dataset.sectionId = section.id;

        const currentAssignment = this.template.assignments[section.id];
        if (currentAssignment) {
            slot.classList.add('assigned');
        }

        // Label
        const label = document.createElement('div');
        label.className = 'slot-label';
        label.textContent = section.label;

        // Thumbnail container
        const thumbContainer = document.createElement('div');
        thumbContainer.className = 'slot-thumbnail';

        if (currentAssignment) {
            // Show assigned image
            const canvas = document.createElement('canvas');
            canvas.width = 50;
            canvas.height = 50;
            const ctx = canvas.getContext('2d');

            const src = currentAssignment.canvas;
            const scale = Math.min(50 / src.width, 50 / src.height);
            const w = src.width * scale;
            const h = src.height * scale;
            ctx.drawImage(src, (50 - w) / 2, (50 - h) / 2, w, h);

            thumbContainer.appendChild(canvas);
        } else {
            thumbContainer.classList.add('empty');
        }

        slot.appendChild(label);
        slot.appendChild(thumbContainer);

        // Click to open picker
        slot.addEventListener('click', () => this.openPicker(section));

        // Drop target
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            slot.classList.add('drag-over');
        });

        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drag-over');
        });

        slot.addEventListener('drop', (e) => {
            e.preventDefault();
            slot.classList.remove('drag-over');

            const selectionId = e.dataTransfer.getData('text/plain');
            if (selectionId) {
                const selection = this.selections.find(s => s.id === selectionId);
                if (selection) {
                    this.template.setAssignment(section.id, selection);
                    this.updateAssignmentPanel();
                }
            }
        });

        return slot;
    }

    printTemplate() {
        this.template.renderForPrint(this.printCanvas);
        window.print();
    }

    downloadTemplate() {
        this.template.renderForPrint(this.printCanvas);
        const link = document.createElement('a');
        link.download = 'fortune-teller.png';
        link.href = this.printCanvas.toDataURL('image/png');
        link.click();
    }

    clearAll() {
        if (!confirm('Clear all selections and assignments?')) return;

        this.selections = [];
        this.selectionCounter = 0;
        this.selectionsListEl.innerHTML = '';
        this.template.clearAllAssignments();
        this.updateAssignmentPanel();
    }

    // Auto-segmentation methods
    showSegmentOptions() {
        this.segmentOptions.style.display = 'flex';
        this.updateSegmentOptionsUI();
    }

    hideSegmentOptions() {
        this.segmentOptions.style.display = 'none';
        this.instructionsEl.innerHTML = '<p>Click "New Selection" to start drawing a polygon region</p>';
    }

    runAutoSegment() {
        if (this.currentImageIndex < 0) return;

        const imageData = this.images[this.currentImageIndex];
        const img = imageData.element;

        // Create a canvas at original image size for analysis
        const analysisCanvas = document.createElement('canvas');
        analysisCanvas.width = img.width;
        analysisCanvas.height = img.height;
        const analysisCtx = analysisCanvas.getContext('2d');
        analysisCtx.drawImage(img, 0, 0);

        const imgData = analysisCtx.getImageData(0, 0, img.width, img.height);
        const bgType = this.bgTypeSelect.value;
        const threshold = parseInt(this.thresholdSlider.value);
        const minSize = parseInt(this.minSizeSlider.value);

        let regions;

        if (bgType === 'grid') {
            // Grid-based segmentation
            const gridSize = parseInt(this.gridSizeInput.value) || 4;
            regions = this.findGridRegions(img.width, img.height, gridSize);
        } else {
            // Get custom color if needed
            let customColor = null;
            if (bgType === 'custom') {
                const hex = this.customColorPicker.value;
                customColor = {
                    r: parseInt(hex.substr(1, 2), 16),
                    g: parseInt(hex.substr(3, 2), 16),
                    b: parseInt(hex.substr(5, 2), 16)
                };
            }

            // Find connected regions using flood fill
            regions = this.findRegions(imgData, threshold, minSize, bgType, customColor);
        }

        if (regions.length === 0) {
            alert('No regions found. Try adjusting the threshold or minimum size.');
            return;
        }

        // Create selections from regions
        for (const region of regions) {
            this.createSelectionFromRegion(region, imageData);
        }

        this.hideSegmentOptions();
        this.updateAssignmentPanel();
        this.instructionsEl.innerHTML = `<p>Found ${regions.length} regions! Drag them to the template.</p>`;
    }

    findGridRegions(width, height, gridSize) {
        const regions = [];
        const cellWidth = Math.floor(width / gridSize);
        const cellHeight = Math.floor(height / gridSize);

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const x = col * cellWidth;
                const y = row * cellHeight;
                // For the last row/column, extend to edge to handle rounding
                const w = (col === gridSize - 1) ? width - x : cellWidth;
                const h = (row === gridSize - 1) ? height - y : cellHeight;

                regions.push({
                    x: x,
                    y: y,
                    width: w,
                    height: h,
                    pixelCount: w * h
                });
            }
        }

        return regions;
    }

    findRegions(imgData, threshold, minSize, bgType = 'white', customColor = null) {
        const width = imgData.width;
        const height = imgData.height;
        const data = imgData.data;
        const visited = new Uint8Array(width * height);
        const regions = [];

        // Helper: check if pixel is background based on type
        const isBackground = (x, y) => {
            if (x < 0 || x >= width || y < 0 || y >= height) return true;
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];

            switch (bgType) {
                case 'white':
                    // Near-white or transparent = background
                    return a < 128 || (r >= threshold && g >= threshold && b >= threshold);

                case 'black':
                    // Near-black or transparent = background
                    return a < 128 || (r <= threshold && g <= threshold && b <= threshold);

                case 'transparent':
                    // Transparent = background (alpha below threshold)
                    return a < threshold;

                case 'custom':
                    // Color distance from custom color within threshold = background
                    if (customColor) {
                        const dr = r - customColor.r;
                        const dg = g - customColor.g;
                        const db = b - customColor.b;
                        const distance = Math.sqrt(dr * dr + dg * dg + db * db);
                        return distance <= threshold;
                    }
                    return false;

                default:
                    return a < 128 || (r >= threshold && g >= threshold && b >= threshold);
            }
        };

        // Flood fill to find connected region
        const floodFill = (startX, startY) => {
            const stack = [[startX, startY]];
            let minX = startX, maxX = startX;
            let minY = startY, maxY = startY;
            let pixelCount = 0;

            while (stack.length > 0) {
                const [x, y] = stack.pop();

                if (x < 0 || x >= width || y < 0 || y >= height) continue;

                const idx = y * width + x;
                if (visited[idx]) continue;
                if (isBackground(x, y)) continue;

                visited[idx] = 1;
                pixelCount++;

                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);

                // Check 4-connected neighbors
                stack.push([x + 1, y]);
                stack.push([x - 1, y]);
                stack.push([x, y + 1]);
                stack.push([x, y - 1]);
            }

            return { minX, maxX, minY, maxY, pixelCount };
        };

        // Scan image for regions
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = y * width + x;
                if (visited[idx]) continue;
                if (isBackground(x, y)) {
                    visited[idx] = 1;
                    continue;
                }

                // Found unvisited non-background pixel - flood fill
                const region = floodFill(x, y);

                if (region.pixelCount >= minSize) {
                    // Add padding
                    const padding = 5;
                    regions.push({
                        x: Math.max(0, region.minX - padding),
                        y: Math.max(0, region.minY - padding),
                        width: Math.min(width - region.minX + padding * 2, region.maxX - region.minX + padding * 2),
                        height: Math.min(height - region.minY + padding * 2, region.maxY - region.minY + padding * 2),
                        pixelCount: region.pixelCount
                    });
                }
            }
        }

        // Sort by position (top-left to bottom-right)
        regions.sort((a, b) => {
            const rowA = Math.floor(a.y / (height / 4));
            const rowB = Math.floor(b.y / (height / 4));
            if (rowA !== rowB) return rowA - rowB;
            return a.x - b.x;
        });

        return regions;
    }

    createSelectionFromRegion(region, imageData) {
        // Create a rectangular selection from the region bounds
        const selection = {
            points: [
                { x: region.x, y: region.y },
                { x: region.x + region.width, y: region.y },
                { x: region.x + region.width, y: region.y + region.height },
                { x: region.x, y: region.y + region.height }
            ],
            bounds: {
                x: region.x,
                y: region.y,
                width: region.width,
                height: region.height
            }
        };

        // Extract the selection as a canvas
        const extractedCanvas = this.selector.extractSelection(imageData.element, selection);

        // Create selection data
        this.selectionCounter++;
        const selectionData = {
            id: `sel_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: `Face ${this.selectionCounter}`,
            imageId: imageData.id,
            imageName: imageData.name,
            selection: selection,
            canvas: extractedCanvas
        };

        this.selections.push(selectionData);
        this.addSelectionToList(selectionData, imageData.element);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FortuneTellerApp();
});
