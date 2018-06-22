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
        'click .modal-footer #delete_qa': 'deleteQuestionDefault',
        'click #save': 'saveData',
        'click #pngdl': 'exportPng',
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
                if (cell.get('type') === 'qad.Normal') {
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
    //      width: 2000,
    //      height: 2000,
    //      model: this.graph
    //  });
    //var paperScroller = this.paperScroller = new joint.ui.PaperScroller({
            //paper: paper,
    //      paper: paper,
    //      autoResizePaper: true,
        //  cursor:'graph'
        //});
        
         // this.$('#paper').append(paperScroller.el);
         //   paperScroller.render().center();
        //  paperScroller.$el.appendTo('#paper');
        //  paperScroller.render();
            
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
        if(elementView.model.get('type') === 'qad.Normal' && !elementView.model.get('isDrag')){
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
                    //.changeHandle('clone', { position: 'ne', icon: '/admin/assets/lib/chat-bot-map/image/icon_copy.png' })
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
            //  return cell;
            //},
            dragEndClone: function(cell) {
                var itemView;
                switch(cell.attributes.attrs.text.text) {
                    case BTN_CREATE_QUESTION:
                        itemView = new joint.shapes.qad.Normal({
                            question: 'クリックしてチャットボットを選択',
                            typeQA: '1'
                        });
                        break;
                    case BTN_CREATE_ANSWER:
                        //TO DO SOMETHING
                        itemView = new joint.shapes.qad.Normal({
                            question: 'クリックしてチャットボットを選択',
                            typeQA: '2'
                        });
                        break;
                    default:
                        itemView = cell
                }
                var temps = _.without(itemView.attributes.ports.items, itemView.attributes.ports.items[0]);
                //remove port out data
                itemView.attributes.ports.items = _.without(temps, temps[0]);
                itemView.set('ports', itemView.get('ports'))
                //remove port in  to display
                var tempSettingPort = _.without(itemView._portSettingsData.ports, itemView._portSettingsData.ports[0]);
                //remove port out  to display
                itemView._portSettingsData.ports = _.without(tempSettingPort, tempSettingPort[0])
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
                    typeQA = cell.attributes.typeQA
                    htmlText = ''
                    if (typeQA == 1) {
                        var map_json = $('#chatbot_rule_normal').text()
                        var data = $.parseJSON(map_json)
                        for ( var key in data ) {
                            if(!data[key].content) {
                                htmlText += '<p data-id="' + data[key].part_id + '" data-viewed="' + data[key].viewed + '" id="question-' + key + '" class="add-question-modal">' + data[key].part_name + '</p>';
                            } else {
                                var blkstr = $.map(data[key].content.answers, function(value, index) {
                                    var str = value.name;
                                    return [str];
                                }).join(", ");
                                htmlText += '<p data-id="' + data[key].part_id + '" data-viewed="' + data[key].viewed + '" data-option="' + blkstr + '" id="question-' + key + '" class="add-question-modal">' + data[key].content.question + '</p>';
                            }
                        }
                        $('#modal #questions').html('');
                        $('#search-container .search-field').val('');
                        $('#modal #questions').append(htmlText);
                    } else if (typeQA == 2) {
                        var map_json = $('#chatbot_rule_plus').text()
                        var data = $.parseJSON(map_json)

                        for ( var key in data ) {
                            if(!data[key].content) {
                                htmlText += '<p data-id="' + data[key].part_id + '" data-viewed="' + data[key].viewed + '" id="question-' + key + '" class="add-question-modal">' + data[key].part_name + '</p>';
                            } else {
                                var blkstr = $.map(data[key].content.answers, function(value, index) {
                                    var str = value.name;
                                    return [str];
                                }).join(", ");
                                htmlText += '<p data-id="' + data[key].part_id + '" data-viewed="' + data[key].viewed + '" data-option="' + blkstr + '" id="question-' + key + '" class="add-question-modal">' + data[key].content.question + '</p>';
                            }
                        }
                        $('#modal #questions').html('');
                        $('#search-container .search-field').val('');
                        $('#modal #questions').append(htmlText);
                    }


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
				if(linkView.sourceView.model.get('type') === 'qad.Default') {
					linkView.sourceMagnet.setAttribute('magnet', 'passive')
				}
				var portId = magnet && magnet.getAttribute('port');
				if (portId) console.log('new port:', portId);
			},
			'link:disconnect': function(linkView, evt, elementView, magnet, arrowhead) {
				var portId = magnet && magnet.getAttribute('port');
				if (portId) console.log('new port:', portId);
			},
        }, this);

        graph.on('remove', function(cell, collection, opt) {
            this.selection.reset([]);
			console.log(cell)
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
				
				
				/*if(cellViewS.model.get('type') === 'qad.Default' && 
				cellViewS.model.get('hasConnected') &&
				magnetT && magnetT.getAttribute('port-group') === 'in') {
					return false;
				};
				*/
				
                // Prevent linking from input ports.
                if (magnetS && magnetS.getAttribute('port-group') === 'in') return false;
                // Prevent linking from output ports to input ports within one element.
                if (cellViewS === cellViewT) return false;
                //validate link from question to answer
                if(cellViewT.model.get('type') === 'qad.Normal' && cellViewT.model.get('type') === 'qad.Default') return false;

                if(cellViewS.model.get('type') === 'qad.Normal' && cellViewT.model.get('isDrag') === true) {
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
        var id = $("#question-id").text();
        var viewed = $("#viewed-val").text();
        var text = $("#question-val").text();
        var optionResults = $("#answers-val").text();

        this.selectionCell.model.set('isDrag', false);
        this.selectionCell.model.set('question', text);
        var x = this.selectionCell.model.get('position').x;
        var y = this.selectionCell.model.get('position').y;
        // if(optionResults.length != 0) {
        this.selectionCell.model.remove();
        var newQa = app.Factory.createQuestionOption(id, viewed, text, optionResults, x, y, false)
        //remove default out port
        if(optionResults.length != 0) {
            newQa.attributes.ports.items = _.without(newQa.attributes.ports.items, newQa.attributes.ports.items[1])
            newQa.set('ports', newQa.get('ports'))
            newQa._portSettingsData.ports = _.without(newQa._portSettingsData.ports, newQa._portSettingsData.ports[1])
        }

        newQa.addTo(this.graph);
        $('#listRule').modal('hide');
    },

    deleteQuestionDefault: function(){
        this.selectionCell.model.remove();
    },

    saveData: function () {
        var mapid = $('#chatbot_map_id').text()
        console.log(mapid)
	showLoader();
        $.ajax ({
            url:        '/admin/cp/chat-bot-save',
            type:       'POST',
            data: {
                data: JSON.stringify(this.graph.toJSON()),
                map_id : mapid
            },
            success: function(data, status) {
		hideLoader();
                console.log(data)
                if(data == 'Not relation') {
                    alert('保存できません。マップデータ正しくありません。');
                } else {
                    alert('マップ保存できました。');
                }
            },
            error : function(xhr, textStatus, errorThrown) {
		hideLoader();
                alert('Ajax request failed.');
            }
        });
    },

    exportPng: function () {
	var svg = document.querySelector("svg");
	var svgData = new XMLSerializer().serializeToString(svg);
	var canvas = document.createElement("canvas");
	canvas.width = svg.width.baseVal.value;
	canvas.height = svg.height.baseVal.value;

	var ctx = canvas.getContext("2d");
	var image = new Image;
	image.onload = function(){
	    ctx.drawImage( image, 0, 0 );
	    var a = document.createElement("a");
	    a.href = canvas.toDataURL("image/png");
	    a.setAttribute("download", "chatbotmap.png");
	    a.dispatchEvent(new CustomEvent("click"));
	}
	image.src = "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(svgData))); 
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
        var map_json = $('#data_map_loaded').text()
        this.graph.fromJSON($.parseJSON(map_json));
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
    $.getJSON('http://tittle-app.tk:8088/api/map-data', function(data) {
        var htmlText ='';
        for ( var key in data ) {
            if(!data[key].content) {
                htmlText += '<p data-id="' + data[key].part_id + '" data-viewed="' + data[key].viewed + '" id="question-' + key + '" class="add-question-modal">' + data[key].part_name + '</p>';
            } else {
                var blkstr = $.map(data[key].content.answers, function(value, index) {
                    var str = value.name;
                    return [str];
                }).join(", ");
                htmlText += '<p data-id="' + data[key].part_id + '" data-viewed="' + data[key].viewed + '" data-option="' + blkstr + '" id="question-' + key + '" class="add-question-modal">' + data[key].content.question + '</p>';
            }
        }
        $('#modal #questions').append(htmlText);
        $('#modal').on('click', '.add-question-modal', function(e){
            e.preventDefault();
            var txt = $(this).text();
            if(txt.length > 10){
                txt = txt.substring(0, 12) + ' ...';
            }
            var option = $(this).data("option");
            var id = $(this).data("id");
            var viewed = $(this).data("viewed");
            if (typeof option !== 'undefined'){
                $("#answers-val").text(option);
            } else {
                $("#answers-val").text('');
            }
            $("#question-val").text(txt);
            $("#question-id").text(id);
            $("#viewed-val").text(viewed);
        });
    });

});
