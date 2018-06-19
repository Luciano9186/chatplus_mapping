joint.dia.Element.define('qad.Answer', {
		ports: {
        groups: {
            out: {
                position: 'right',
                attrs: {
                    circle: {
                        magnet: false,
                        stroke: '#90A4AE',
						fill: 'white',
                        r: 10
                    }
                }
            }
        },
		   items: [{
            group: 'out'
        }],
    },
    attrs: {

        rect: {
            fill: '#4b4a67',
            stroke: 'none',
            refWidth: '100%',
            refHeight: '100%',
            rx: 3,
            ry: 3
        },
        text: {
            fontSize: 14,
            refX: .5,
            refY: .5,
            yAlignment: 'middle',
            xAlignment: 'middle',
            fill: '#f6f6f6',
            fontFamily: 'Arial, helvetica, sans-serif'
        }
    }
}, {
    markup: '<rect/><text/>',

    initialize: function() {

        joint.dia.Element.prototype.initialize.apply(this, arguments);

        this.attr('text/text', this.get('answer'));
        this.on('change:answer', function() {
            this.attr('text/text', this.get('answer'));
        }, this);
    }
});

joint.shapes.qad.AnswerView = joint.dia.ElementView.extend({

    initialize: function() {

        joint.dia.ElementView.prototype.initialize.apply(this, arguments);
        this.autoresize();
        this.listenTo(this.model, 'change:answer', this.autoresize, this);
    },

    autoresize: function() {

        var dim = joint.util.measureText(this.model.get('answer'), {
            fontSize: this.model.attr('text/fontSize')
        });
        this.model.resize(dim.width + 50, dim.height + 50);
    }
});

joint.dia.Element.define('qad.Question', {
    optionHeight: 40,
    questionHeight: 45,
    paddingBottom: 30,
    minWidth: 260,
	isDrag: true,
    ports: {
        groups: {
            in: {
                position: 'left',
                attrs: {
                    circle: {
                        magnet: 'passive',
                        stroke: '#90A4AE',
                        fill: 'white',
                        r: 10
                    },
                    text: {
                        pointerEvents: 'none',
                        fontSize: 12,
                        fill: 'black'
                    }
                },
                label: {
                    position: {
                        name: 'left',
                        args: { x: 5 }
                    }
                }
            },
            out: {
                position: 'right',
                attrs: {
                    circle: {
                        magnet: true,
                        stroke: '#90A4AE',
						fill: 'white',
                        r: 10
                    }
                }
            }
        },
        items: [{
            group: 'in',
        },{
            group: 'out',
        }]
    },
    attrs: {
        '.': {
            magnet: false
        },
        '.body': {
            refWidth: '100%',
            refHeight: '105%',
			rx: 7,
            stroke: 'none',
            fill: {
                type: 'linearGradient',
                stops: [
                    { offset: '0%', color: '#F3D2D1' },
                    { offset: '100%', color: '#F3D2D1' }
                ],
                // Top-to-bottom gradient.
                attrs: { x1: '0%', y1: '0%', x2: '0%', y2: '100%' }
            }
        },
        '.btn-add-option': {
            refX: '103%',
            refDy: 5,
            cursor: 'pointer',
            fill: 'black'
        },
        '.btn-remove-option': {
         xAlignment: 210,
		 yAlignment: 16,
         cursor: 'pointer',
		 fill:'gray'
        },
        '.options': {
            refX: 0
        },

        // Text styling.
        text: {
            fontFamily: 'Arial'
        },
        '.option-text': {
            fontSize: 11,
            fill: '#4b4a67',
            refX: 30,
            yAlignment: 'middle'
        },
        '.question-text': {
            fill: 'black',
            refX: 130,
            refY: 15,
            fontSize: 15,
            textAnchor: 'middle'
        },		
		    '.end-text': {
            fill: '#7A827D',
            refX: 130,
			refY: '100%',
            fontSize: 15,
            textAnchor: 'end',
        },

        // Options styling.
        '.option-rect': {
			//corner top left and right
            rx: 3,
			//corner bottom left and right
            ry: 3,
			//margin left 10
			refX: 20,
            stroke: '#d14c43',
            fill: '#FFFFFF',
			width:'219',
			height:'40'
		},
		'.header-rect': {
			rx:5,
			ry:5,
			//margin left and right
			refX: 5,
			refY: 5,
            //stroke: 'white',
            fill: '#FFFFFF',
			width:'250',
			height:'30',
        },
		'.header-rect-mask': {
			//margin left and right
			refX:5,
			refY: 30,
            //stroke: 'white',
            fill: '#FFFFFF',
			width:'250',
			height:'5',
        },
		'.end-rect': {
			//corner bottom left and right
			//margin left 10
            y:-5,
			ry: 7,
			refY: '100%',
            //stroke: '#F3D2D1',
            fill: '#F3D2D1',
			width:'260',
			height:'26'
        }
    }
}, {

    markup: '<rect class="body"/><g><rect class="end-rect"/><text class="end-text"/><rect class="header-rect"  z="1" transform="matrix(1,0,0,1,2,1)"></rect><rect class="header-rect-mask" z="10"></rect><text class="question-text">Hello</text></g><g class="options"></g>',
    optionMarkup: '<g class="option"><rect class="option-rect"/><text class="option-text"/></g>',
	//optionMarkup: '<g class="option"><rect class="option-rect"/><path class="btn-remove-option" d="M0,0 15,0 15,5 0,5z"/><text class="option-text"/></g>',

    initialize: function() {
        joint.dia.Element.prototype.initialize.apply(this, arguments);
        this.on('change:options', this.onChangeOptions, this);
        this.on('change:question', function() {
            this.attr('.question-text/text', this.get('question') || '');
			this.attr('.end-text/text', this.get('count') || '');
            this.autoresize();
        }, this);

        this.on('change:questionHeight', function() {
            this.attr('.options/refY', this.get('questionHeight'), { silent: true });
            this.autoresize();
        }, this);

        this.on('change:optionHeight', this.autoresize, this);

        this.attr('.options/refY', this.get('questionHeight'), { silent: true });
        this.attr('.question-text/text', this.get('question'), { silent: true });
		   this.attr('.end-text/text', this.get('count'), { silent: true });

        this.onChangeOptions();
    },

    onChangeOptions: function() {

        var options = this.get('options');
        var optionHeight = this.get('optionHeight');

        // First clean up the previously set attrs for the old options object.
        // We mark every new attribute object with the `dynamic` flag set to `true`.
        // This is how we recognize previously set attributes.
        var attrs = this.get('attrs');
        _.each(attrs, function(attrs, selector) {

            if (attrs.dynamic) {
                // Remove silently because we're going to update `attrs`
                // later in this method anyway.
                this.removeAttr(selector, { silent: true });
            }
        }, this);

        // Collect new attrs for the new options.
        var offsetY = 0;
        var attrsUpdate = {};
        var questionHeight = this.get('questionHeight');

        _.each(options, function(option) {

            var selector = '.option-' + option.id;

            attrsUpdate[selector] = { transform: 'translate(0, ' + offsetY + ')', dynamic: true };
            attrsUpdate[selector + ' .option-rect'] = { height: optionHeight, dynamic: true };
            attrsUpdate[selector + ' .option-text'] = { text: option.text, dynamic: true, refY: optionHeight / 2 };

            offsetY += optionHeight;

            var portY = offsetY - optionHeight / 2 + questionHeight;
            if (!this.getPort(option.id)) {
                this.addPort({ group: 'out', id: option.id, args: { y: portY } });
            } else {
                this.portProp(option.id, 'args/y', portY);
            }
        }, this);

        this.attr(attrsUpdate);
        this.autoresize();
    },

    autoresize: function() {

        var options = this.get('options') || [];
        var gap = 10;
        var height = options.length * this.get('optionHeight') + this.get('questionHeight') + gap;
        var width = joint.util.measureText(this.get('question'), {
            fontSize: this.attr('.question-text/fontSize')
        }).width;
        this.resize(Math.max(this.get('minWidth') || 150, width), height);
    },

    addOption: function(option) {
        var options = JSON.parse(JSON.stringify(this.get('options')));
        options.push(option);
        this.set('options', options);
    },

    removeOption: function(id) {
        var options = JSON.parse(JSON.stringify(this.get('options')));
        this.removePort(id);
        this.set('options', _.without(options, _.findWhere(options, { id: id })));
    },

    changeOption: function(id, option) {

        if (!option.id) {
            option.id = id;
        }

        var options = JSON.parse(JSON.stringify(this.get('options')));
        options[_.findIndex(options, { id: id })] = option;
        this.set('options', options);
    }
});

joint.shapes.qad.QuestionView = joint.dia.ElementView.extend({
	pointerdown: function () {
        this._click = true;
        joint.dia.ElementView.prototype.pointerdown.apply(this, arguments);
    },
    pointermove: function () {
        this._click = false;
        joint.dia.ElementView.prototype.pointermove.apply(this, arguments);
    },
    pointerup: function (evt, x, y) {
        if (this._click) {
            this.notify('cell:click', evt, x, y);
        } else {
            joint.dia.ElementView.prototype.pointerup.apply(this, arguments);
        }
    },
    events: {
        'click .btn-add-option': 'onAddOption',
        'click .btn-remove-option': 'onRemoveOption'
    },

    initialize: function() {
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);
        this.listenTo(this.model, 'change:options', this.renderOptions, this);
    },

    renderMarkup: function() {

        joint.dia.ElementView.prototype.renderMarkup.apply(this, arguments);

        // A holder for all the options.
        this.$options = this.$('.options');
        // Create an SVG element representing one option. This element will
        // be cloned in order to create more options.
        this.elOption = V(this.model.optionMarkup);

        this.renderOptions();
    },

    renderOptions: function() {

        this.$options.empty();

        _.each(this.model.get('options'), function(option, index) {

            var className = 'option-' + option.id;
            var elOption = this.elOption.clone().addClass(className);
            elOption.attr('option-id', option.id);
            this.$options.append(elOption.node);

        }, this);

        // Apply `attrs` to the newly created SVG elements.
        this.update();
    },

    onAddOption: function() {

        this.model.addOption({
            id: _.uniqueId('option-'),
            text: 'Option ' + this.model.get('options').length
        });
    },

    onRemoveOption: function(evt) {
		//disable remove option for question just create by drag
		if(this.model.isDrag) {
			return;
		}
        this.model.removeOption(V(evt.target.parentNode).attr('option-id'));
    }
});

// Utils

joint.util.measureText = function(text, attrs) {

    var fontSize = parseInt(attrs.fontSize, 10) || 10;

    var svgDocument = V('svg').node;
    var textElement = V('<text><tspan></tspan></text>').node;
    var textSpan = textElement.firstChild;
    var textNode = document.createTextNode('');

    textSpan.appendChild(textNode);
    svgDocument.appendChild(textElement);
    document.body.appendChild(svgDocument);

    var lines = text.split('\n');
    var width = 0;

    // Find the longest line width.
    _.each(lines, function(line) {

        textNode.data = line;
        var lineWidth = textSpan.getComputedTextLength();

        width = Math.max(width, lineWidth);
    });

    var height = lines.length * (fontSize * 1.2);

    V(svgDocument).remove();

    return { width: width, height: height };
};