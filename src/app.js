var app = app || {};
var qad = window.qad || {};
var BTN_CREATE_QUESTION = 'チャットボット';
var BTN_CREATE_ANSWER = 'チャットボット＋';
app.AppView = joint.mvc.View.extend({
    el: '#app',

    events: {
        'click #toolbar .add-question': 'addQuestion',
        'click #toolbar .add-answer': 'addAnswer',
        'click #toolbar .preview-dialog': 'previewDialog',
        'click #toolbar .code-snippet': 'showCodeSnippet',
        'click #toolbar .load-example': 'loadExample',
        'click #toolbar .clear': 'clear',
        'click #modal .add-question-modal': 'updateQuestionModal',
        'click #save': 'saveData',
    },

    init: function() {

        this.initializePaper();
        this.initializeSelection();
        this.initializeHalo();
        this.initializeInlineTextEditor();
		this.initializeToolbar();
		this.initializeStencil();
        // this.initializeTooltips();

        this.loadExample();
    },

    initializeTooltips: function() {

        new joint.ui.Tooltip({
            rootTarget: '#paper',
            target: '.joint-element',
            content: _.bind(function(target) {

                var cell = this.paper.findView(target).model;

                var text = '- Double-click to edit text inline.';
                if (cell.get('type') === 'qad.Question') {
                    text += '<br/><br/>- Connect a port with another Question or an Answer.';
                }

                return  text;

            }, this),
            direction: 'right',
            right: '#paper',
            padding: 20
        });
    },
	
   initializeToolbar: function() {
	//var paper = new joint.dia.Paper({
	//		width: 2000,
	//		height: 2000,
	//		model: this.graph
	//	});
    //var paperScroller = this.paperScroller = new joint.ui.PaperScroller({
			//paper: paper,
	//		paper: paper,
	//		autoResizePaper: true,
		//	cursor:'graph'
		//});
		
		 // this.$('#paper').append(paperScroller.el);
         //   paperScroller.render().center();
		//	paperScroller.$el.appendTo('#paper');
		//	paperScroller.render();
			
		var toolbar = new joint.ui.Toolbar({
			// initialize tools with default settings

			  tools: [
        { type: 'zoomIn', name: 'zoom-in' },
        { type: 'button', name: 'zoom-to-fit', text: 'Zoom-To-Fit' },
        { type: 'zoomOut', name: 'zoom-out'},
    ],
			references: {
				paperScroller: this.paperScroller
			}
		});
		toolbar.on({
                'zoom-to-fit:pointerclick': _.bind(this.zoomToFit, this),
            });

		toolbar.$el.appendTo('#toolbar-container');
		toolbar.render().center;

		//toolbar.render().$el.appendTo('#toolbar-container');
    },
	
	zoomToFit: function(){
		this.paperScroller.zoom(0.8, { max: 1 })
	},

    initializeInlineTextEditor: function() {

        var cellViewUnderEdit;

        var closeEditor = _.bind(function() {

            if (this.textEditor) {
                this.textEditor.remove();
                // Re-enable dragging after inline editing.
                cellViewUnderEdit.setInteractivity(true);
                this.textEditor = cellViewUnderEdit = undefined;
            }
        }, this);
	/*
        this.paper.on('cell:pointerdblclick', function(cellView, evt) {

            // Clean up the old text editor if there was one.
            closeEditor();

            var vTarget = V(evt.target);
            var text;
            var cell = cellView.model;
            $("#nodeQa .qName").val(cell.get('question'));
            var answers = cell.get('options');
            var htmlText ='';
            for ( var key in answers ) {
                htmlText += '<div class="row"><div class="col-md-10 m-bottom-sm form-inline"><input style="width:100%" type="text" class="form-control form-check" value="'+ answers[key].text + '" required="required"></div><div class="col-md-1"><button class="delAnswer">x</button></div></div>';
            }
            $('.add-answer').before(htmlText);
            $("#nodeQa").modal('show');            

            if (text) {

                this.textEditor = new joint.ui.TextEditor({ text: text });
                this.textEditor.render(this.paper.el);

                this.textEditor.on('text:change', function(newText) {

                    var cell = cellViewUnderEdit.model;
                    // TODO: prop() changes options and so options are re-rendered
                    // (they are rendered dynamically).
                    // This means that the `text` SVG element passed to the ui.TextEditor
                    // no longer exists! An exception is thrown subsequently.
                    // What do we do here?
                    cell.prop(cellViewUnderEdit.textEditPath, newText);

                    // A temporary solution or the right one? We just
                    // replace the SVG text element of the textEditor options object with the new one
                    // that was dynamically created as a reaction on the `prop` change.
                    if (cellViewUnderEdit.optionId) {
                        this.textEditor.options.text = cellViewUnderEdit.$('.option.option-' + cellViewUnderEdit.optionId + ' .option-text')[0];
                    }

                }, this);

                cellViewUnderEdit = cellView;
                // Prevent dragging during inline editing.
                cellViewUnderEdit.setInteractivity(false);
            }
        }, this);
	*/
        $(document.body).on('click', _.bind(function(evt) {

            var text = joint.ui.TextEditor.getTextElement(evt.target);
            if (this.textEditor && !text) {
                closeEditor();
            }

        }, this));
    },

    initializeHalo: function() {
		
        this.paper.on('cell:click', function(elementView, evt) {
		if(elementView.model.get('type') === 'qad.Question' && !elementView.model.get('isDrag')){
				var halo = new joint.ui.Halo({
					cellView: elementView,
					boxContent: false
				});

				halo.removeHandle('resize')
					.removeHandle('rotate')
					.removeHandle('fork')
					.removeHandle('link')
					.removeHandle('unlink')
					// .removeHandle('remove')
					// .addHandle({ name: 'addnew', position: 'se', icon: 'image/icon_clone.png' })
					.changeHandle('clone', { position: 'ne', icon: 'image/icon_copy.png' })
					.render();
		}

        }, this);
    },
	
	initializeStencil: function(){
		var stencil = new joint.ui.Stencil({
					graph: this.graph,
					paper: this.paper,
					//When drag, a clone of rec instance will be created, 
					//it make the id we set for item changing, so we need implement this event 
					//to get correct item. If not implement function, id auto generate.
					//dragStartClone: function(cell){
					//	return cell;
					//},
					dragEndClone: function(cell) {
						var itemView;
						switch(cell.attributes.attrs.text.text) {
							case BTN_CREATE_QUESTION:
								itemView = new joint.shapes.qad.Question({
									question: 'ルールを選択してください。',
									//count: '1'
								});
								break;
							case BTN_CREATE_ANSWER:
								//TO DO SOMETHING
									itemView = cell
								break;
							default:
								itemView = cell
						}
						return itemView;
					},
					/**
					dragStartClone: function(cell){
						var currentGraph = stencil.getGraph();
						var currentPaper = stencil.getPaper();
						var view = currentGraph.getCell(BTN_CREATE_ANSWER).findView(currentPaper);
						switch(cell.attrissbutes.attrs.text.text) {
							case BTN_CREATE_ANSWER:
								//TO DO SOMETHING
								 view.on('element:pointerup', function(elementView, evt) {
									 console.log('aaaa');
												}, this);
									return cell.clone();
								break;
							default:
								break;
						}
						return cell.clone();
					}
					**/
				});

			stencil.render().$el.appendTo('.svg-stencil-container');
			stencil.load([
				app.Factory.createItemLeftMenu(35, 5, BTN_CREATE_QUESTION),
                app.Factory.createItemLeftMenuWithItemId(35, 55, BTN_CREATE_ANSWER, BTN_CREATE_ANSWER)
			]);
	},
	
	

    initializeSelection: function() {

        var paper = this.paper;
        var graph = this.graph;
        var selection = this.selection = new app.Selection;

        selection.on('add reset', function() {
            var cell = this.selection.first();
            if (cell) {
				var isDrag = cell.attributes.isDrag;
				if(isDrag){
					$('#listRule').modal('show');
				} else {
					this.status('Selection: ' + cell.get('type'));
				}
                
            } else {
                this.status('Selection emptied.');
            }
        }, this);

        paper.on({
			'cell:click': function(elementView){
				this.selectionCell = elementView;
                this.selection.reset([elementView.model]);
			},
			'cell:pointerup': function(elementView){
				//console.log('pointerup')
			},
            'blank:pointerdown': function() {
                this.selection.reset([]);
            }, 
			'link:connect': function(linkView, evt, elementView, magnet, arrowhead) {
				var portId = magnet && magnet.getAttribute('port');
				if (portId) console.log('new port:', portId);
			},
			'link:disconnect': function(linkView, evt, elementView, magnet, arrowhead) {
				var portId = magnet && magnet.getAttribute('port');
				if (portId) console.log('new port:', portId);
			},
        }, this);

        graph.on('remove', function() {
            this.selection.reset([]);
        }, this);

        new app.SelectionView({
            model: selection,
            paper: paper
        });

        document.body.addEventListener('keydown', _.bind(function(evt) {

            var code = evt.which || evt.keyCode;
            // Do not remove the element with backspace if we're in inline text editing.
            if ((code === 8 || code === 46) && !this.textEditor && !this.selection.isEmpty()) {
                this.selection.first().remove();
                this.selection.reset([]);
                return false;
            }

            return true;

        }, this), false);
    },

    initializePaper: function() {
        this.paper = new joint.dia.Paper({
			width: 1200,
			height: 800,
            gridSize: 10,
            snapLinks: {
                radius: 75
            },
            linkPinning: false,
            multiLinks: false,
            defaultLink: app.Factory.createLink(),
            validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
                // Prevent linking from input ports.
                if (magnetS && magnetS.getAttribute('port-group') === 'in') return false;
                // Prevent linking from output ports to input ports within one element.
                if (cellViewS === cellViewT) return false;
				//validate link from question to answer
				if(cellViewT.model.get('type') === 'qad.Question' && cellViewT.model.get('type') === 'qad.Answer') return false;

				if(cellViewS.model.get('type') === 'qad.Question' && cellViewT.model.get('isDrag') === true) {
					//TODO SOMETHING	
					return false;
				}
				
                // Prevent linking to input ports.
                if(magnetT && magnetT.getAttribute('port-group') === 'in'){
					return true;
				} 
				return false;
            },
            validateMagnet: function(cellView, magnet) {
                // Note that this is the default behaviour. Just showing it here for reference.
                return magnet.getAttribute('magnet') !== 'passive';
            },
        });
		this.graph = this.paper.model;
      var paperScroller = this.paperScroller = new joint.ui.PaperScroller({
			paper: this.paper,
			autoResizePaper: true,
			cursor:'graph'
		});
		 this.$('#paper').append(paperScroller.el);
		paperScroller.render().center();
		this.paper.on('blank:pointerdown', function(evt, x, y){
			this.paperScroller.startPanning(evt, x, y);
		}, this);
    },

    // Show a message in the statusbar.
    status: function(m) {
        this.$('#statusbar .message').text(m);
    },

    addQuestion: function() {

        app.Factory.createQuestion('Question').addTo(this.graph);
        this.status('Question added.');
    },

    updateQuestionModal: function() {
        var text = $("#question-val").text();
        var optionResults = $("#answers-val").text();
		//var optionResults = $("#answers-val").text().split(',');
		//var options = JSON.parse(JSON.stringify(optionResults));
		this.selectionCell.model.set('isDrag', false);
		this.selectionCell.model.set('question', text);
		var x = this.selectionCell.model.get('position').x;
		var y = this.selectionCell.model.get('position').y;
		var id = $("#question-id").text();
		if(optionResults.length != 0) {	
			this.selectionCell.model.remove();
			 var newQa = app.Factory.createQuestionOption(id, text, optionResults, x, y, false)
			 //remove default out port
			 newQa.attributes.ports.items = _.without(newQa.attributes.ports.items, newQa.attributes.ports.items[1])
			 newQa.set('ports', newQa.get('ports'))
			 newQa._portSettingsData.ports = _.without(newQa._portSettingsData.ports, newQa._portSettingsData.ports[1])
			 newQa.addTo(this.graph);
			/*
			if(this.selectionCell.model.get('options')){
				this.selectionCell.model.removeOption(this.selectionCell.model.get('options')[0].id);
			}
			
			_.each(options, function(optionElement, index) {
			    if(optionElement) {
                    this.selectionCell.model.addOption({
                        id: _.uniqueId('option-'),
                        text: optionElement
                    });
                }
        }, this);
		this.selectionCell.model.set('option', options);
		*/
		} else {

			 //remove default out port
			 this.selectionCell.model.attributes.ports.items = _.without(this.selectionCell.model.attributes.ports.items, this.selectionCell.model.attributes.ports.items[1])
			 this.selectionCell.model.set('ports', this.selectionCell.model.get('ports'))
			 this.selectionCell.model._portSettingsData.ports = _.without(this.selectionCell.model._portSettingsData.ports, this.selectionCell.model._portSettingsData.ports[1])
		}
        $('#listRule').modal('hide');
    },

    saveData: function () {
        console.log(JSON.stringify(this.graph.toJSON()))
    },

    addAnswer: function() {

        app.Factory.createAnswer('Answer').addTo(this.graph);
        this.status('Answer added.');
    },

    previewDialog: function() {

        var cell = this.selection.first();
        var dialogJSON = app.Factory.createDialogJSON(this.graph, cell);
        var $background = $('<div/>').addClass('background').on('click', function() {
            $('#preview').empty();
        });

        $('#preview')
            .empty()
            .append([
                $background,
                qad.renderDialog(dialogJSON)
            ])
            .show();
    },

    loadExample: function() {

        this.graph.fromJSON({"cells":[{"type":"qad.Answer","size":{"width":223.796875,"height":66.8},"inPorts":[{"id":"in","label":"In"}],"outPorts":[{"id":"yes","label":"回答を入力してくだい。"}],"position":{"x":50,"y":100},"angle":0,"answer":"システム.","id":"4073e883-1cc6-46a5-b22d-688ca1934324","z":2,"attrs":{"text":{"text":"Don't mess about with it."}}}]});
    },

    clear: function() {

        this.graph.clear();
    },

    showCodeSnippet: function() {

        var cell = this.selection.first();
        var dialogJSON = app.Factory.createDialogJSON(this.graph, cell);

        var id = _.uniqueId('qad-dialog-');

        var snippet = '';
        snippet += '<div id="' + id + '"></div>';
        snippet += '<link rel="stylesheet" type="text/css" href="http://qad.client.io/css/snippet.css"></script>';
        snippet += '<script type="text/javascript" src="http://qad.client.io/src/snippet.js"></script>';
        snippet += '<script type="text/javascript">';
        snippet += 'document.getElementById("' + id + '").appendChild(qad.renderDialog(' + JSON.stringify(dialogJSON) + '))';
        snippet += '</script>';

        var content = '<textarea>' + snippet + '</textarea>';

        var dialog = new joint.ui.Dialog({
            width: '50%',
            height: 200,
            draggable: true,
            title: 'Copy-paste this snippet to your HTML page.',
            content: content
        });

        dialog.open();
    }
});
$(document).ready(function(){
    var htmlText ='';
    for ( var key in data ) {
        if(!data[key].content) {
            htmlText += '<p id="' + data[key].id + '" class="add-question-modal">' + data[key].part_name + '</p>';
        } else {
            var blkstr = $.map(data[key].content.answers, function(value, index) {
                var str = value.name;
                return [str];
            }).join(", ");
            htmlText += '<p data-option="' + blkstr + '" id="' + data[key].id + '" class="add-question-modal">' + data[key].content.question + '</p>';
        }
    }
    $('#modal').append(htmlText);
    $('#modal').on('click', '.add-question-modal', function(e){
        e.preventDefault();
		var id = $(this)[0].id;
        var txt = $(this).text();
        var option = $(this).data("option")
        if (typeof option !== 'undefined'){
            $("#answers-val").text(option);
        } else {
            $("#answers-val").text('');
        }
        $("#question-val").text(txt);
		$("#question-id").text(id);
    });
});