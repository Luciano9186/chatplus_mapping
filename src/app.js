var app = app || {};
var qad = window.qad || {};

app.AppView = joint.mvc.View.extend({

    el: '#app',

    events: {
        'click #toolbar .add-question': 'addQuestion',
        'click #toolbar .add-answer': 'addAnswer',
        'click #toolbar .preview-dialog': 'previewDialog',
        'click #toolbar .code-snippet': 'showCodeSnippet',
        'click #toolbar .load-example': 'loadExample',
        'click #toolbar .clear': 'clear',
        'click #modal .add-question-modal': 'addQuestionModal',
    },

    init: function() {

        this.initializePaper();
        this.initializeSelection();
        this.initializeHalo();
        this.initializeInlineTextEditor();
		this.initializeToolbar();
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
			tools: ['zoomIn','zoomToFit','zoomSlider','zoomOut'],
			references: {
				paperScroller: this.paperScroller
			}
		});
		toolbar.$el.appendTo('#toolbar-container');
		toolbar.render().center;

		//toolbar.render().$el.appendTo('#toolbar-container');
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

        this.paper.on('cell:pointerdblclick', function(cellView, evt) {

            // Clean up the old text editor if there was one.
            closeEditor();

            var vTarget = V(evt.target);
            var text;
            var cell = cellView.model;

            switch (cell.get('type')) {

                case 'qad.Question':

                    text = joint.ui.TextEditor.getTextElement(evt.target);
                    if (!text) {
                        break;
                    }
                    if (vTarget.hasClass('body') || V(text).hasClass('question-text')) {

                        text = cellView.$('.question-text')[0];
                        cellView.textEditPath = 'question';

                    } else if (V(text).hasClass('option-text')) {

                        cellView.textEditPath = 'options/' + _.findIndex(cell.get('options'), { id: V(text.parentNode).attr('option-id') }) + '/text';
                        cellView.optionId = V(text.parentNode).attr('option-id');

                    } else if (vTarget.hasClass('option-rect')) {

                        text = V(vTarget.node.parentNode).find('.option-text');
                        cellView.textEditPath = 'options/' + _.findIndex(cell.get('options'), { id: V(vTarget.node.parentNode).attr('option-id') }) + '/text';
                    }
				
					else if (vTarget.hasClass('end-text')) {

						text = cellView.$('.end-text')[0];
                        cellView.textEditPath = 'count'
                    }
                    break;

                case 'qad.Answer':
                    text = joint.ui.TextEditor.getTextElement(evt.target);
                    cellView.textEditPath = 'answer';
                    break;
            }

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

        $(document.body).on('click', _.bind(function(evt) {

            var text = joint.ui.TextEditor.getTextElement(evt.target);
            if (this.textEditor && !text) {
                closeEditor();
            }

        }, this));
    },

    initializeHalo: function() {
		
        this.paper.on('element:pointerup', function(elementView, evt) {
		if(elementView.model.get('type') === 'qad.Question'){
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

    initializeSelection: function() {

        var paper = this.paper;
        var graph = this.graph;
        var selection = this.selection = new app.Selection;

        selection.on('add reset', function() {
            var cell = this.selection.first();
            if (cell) {
                this.status('Selection: ' + cell.get('type'));
            } else {
                this.status('Selection emptied.');
            }
        }, this);

        paper.on({
            'element:pointerup': function(elementView) {
                this.selection.reset([elementView.model]);
            },
            'blank:pointerdown': function() {
                this.selection.reset([]);
            }
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
                // Prevent linking to input ports.
                return (magnetT && magnetT.getAttribute('port-group') === 'in') || (cellViewS.model.get('type') === 'qad.Question' && cellViewT.model.get('type') === 'qad.Answer');
            },
            validateMagnet: function(cellView, magnet) {
                // Note that this is the default behaviour. Just showing it here for reference.
                return magnet.getAttribute('magnet') !== 'passive';
            }
        });
		this.graph = this.paper.model;
      var paperScroller = this.paperScroller = new joint.ui.PaperScroller({
			paper: this.paper,
			autoResizePaper: true,
			cursor:'graph'
		});
		 this.$('#paper').append(paperScroller.el);
		paperScroller.render();
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

    addQuestionModal: function() {
        var text = $("#output-val").text();
        app.Factory.createQuestion(text).addTo(this.graph);
        this.status('Question added.');
        $('#myModal').modal('hide');
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

        this.graph.fromJSON({"cells":[{"type":"qad.Question","size":{"width":201.8984375,"height":125},"position":{"x":360,"y":80},"angle":0,"count":"1","question":"質問を入力してください。?","options":[{"id":"yes","text":"回答を入力してくだい。"}],"id":"d849d917-8a43-4d51-9e99-291799c144db","z":1,"attrs":{".options":{"refY":45},".question-text":{"text":"質問を入力してください。?"},".option-yes":{"transform":"translate(0, 0)","dynamic":true},".option-yes .option-rect":{"height":30,"dynamic":true},".option-yes .option-port .port-body":{"port":"yes","dynamic":true},".option-yes .option-text":{"text":"回答を入力してくだい。","dynamic":true},".option-no":{"transform":"translate(0, 30)","dynamic":true},".option-no .option-rect":{"height":30,"dynamic":true},".option-no .option-port .port-body":{"port":"no","dynamic":true},".option-no .option-text":{"text":"No","dynamic":true},".inPorts>.port-in>.port-label":{"text":"In"},".inPorts>.port-in>.port-body":{"port":{"id":"in","type":"in","label":"In"}},".inPorts>.port-in":{"ref":".body","ref-x":0.5}}},{"type":"qad.Answer","size":{"width":223.796875,"height":66.8},"inPorts":[{"id":"in","label":"In"}],"outPorts":[{"id":"yes","label":"回答を入力してくだい。"}],"position":{"x":50,"y":100},"angle":0,"answer":"システム.","id":"4073e883-1cc6-46a5-b22d-688ca1934324","z":2,"attrs":{"text":{"text":"Don't mess about with it."}}},{"type":"link","source":{"id":"4073e883-1cc6-46a5-b22d-688ca1934324","selector":"g:nth-child(1) g:nth-child(3) g:nth-child(1) g:nth-child(4) circle:nth-child(1)      ","port":"yes"},"target":{"id":"d849d917-8a43-4d51-9e99-291799c144db"},"router":{"name":"manhattan"},"connector":{"name":"rounded"},"id":"9d87214a-7b08-47ce-9aec-8e49ed7ae929","embeds":"","z":3,"attrs":{".marker-target":{"d":"M 10 0 L 0 5 L 10 10 z","fill":"#BDBDBD","stroke":"#BDBDBD"},".connection":{"stroke":"#BDBDBD","strokeWidth":2}}}]});
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
    $('#modal').on('click', '.add-question-modal', function(e){
        e.preventDefault();
        var txt = $(this).text();
        $("#output-val").text(txt);
    });
});