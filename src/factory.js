var app = app || {};

app.Factory = {
    createQuestion: function(text) {

        return new joint.shapes.qad.Question({
            position: { x: 400 - 50, y: 30 },
            size: { width: 100, height: 70 },
            question: text,
            inPorts: [{ id: 'in', label: 'In' }],
            options: [
                { id: 'question', text: 'Input Question Here.', height: '50' },
            ],
			count: '1'
        });
    },

    createQuestionOption: function(id, viewed, text, option, x, y, isDrag) {
        if(!option) {
            return new joint.shapes.qad.Question({
                position: { x: x, y: y },
                size: { width: 100, height: 70 },
                question: text,
                inPorts: [{ id: 'in', label: 'In' }],
                options: [
                ],
                isDrag: isDrag,
                count: viewed,
                id: id+"_"+Math.floor(Date.now() / 1000),
            });
        } else {
            var optionArray = option.split(',');
            optionArray = $.map( optionArray, function( n, i ) {
                return {id : 'answer' + i, text : n.trim(), height: '50'}
            });
            return new joint.shapes.qad.Question({
                position: { x: x, y: y },
                size: { width: 100, height: 70 },
                question: text,
                inPorts: [{ id: 'in', label: 'In' }],
                options: optionArray,
                isDrag: isDrag,
                count: viewed,
                id: id+"_"+Math.floor(Date.now() / 1000),
            });
        }
    },

    createAnswer: function(text) {

        return new joint.shapes.qad.Answer({
            position: { x: 400 - 50, y: 30 },
            size: { width: 100, height: 70 },
            answer: text
        });
    },

    createLink: function() {

        return new joint.dia.Link({
            router: { name: 'manhattan' },
            connector: { name: 'rounded' },
            attrs: {
                '.marker-target': {
                    d: 'M 10 0 L 0 5 L 10 10 z',
                    fill: '#BDBDBD',
                    stroke: '#BDBDBD'
                },
                '.connection': {
                    stroke: '#BDBDBD',
                    strokeWidth: 2
                }
            }
        });
    },
	
	//Create item in left menu
	 createItemLeftMenu: function(x, y, title) {
        return new joint.shapes.basic.Rect({
				position: { x: x, y: y},
				size: { width: 150, height: 40 },
				attrs: {
					text: { text:title,   fill: '#f6f6f6', id: 'conghc'},
					rect: {
							  rx: 2,
							  ry: 2,
							  fill: '#337ab7',
							  stroke: '#236298',
							  strokeWidth: 1,
							  strokeDasharray: '0'
						  },
					}
				});
    },
	
	//Create item in left menu with id
	 createItemLeftMenuWithItemId: function(x, y, id, title) {
        return new joint.shapes.basic.Rect({
				id: id,
				position: { x: x, y: y},
				size: { width: 150, height: 40 },
				attrs: { 
					text: { text:title,   fill: '#f6f6f6',},
					rect: {
							  rx: 2,
							  ry: 2,
							  fill: '#337ab7',
							  stroke: '#236298',
							  strokeWidth: 1,
							  strokeDasharray: '0'
						  },
					}
				});
    },

    // Example:
    /*
      {
         root: '1',
         nodes: [
            { id: '1', type: 'qad.Question', question: 'Are you sure?', options: [{ id: 'yes', text: 'Yes' }, { id: 'no', text: 'No' }] },
            { id: '2', type: 'qad.Answer', answer: 'That was good.' },
            { id: '3', type: 'qad.Answer', answer: 'That was bad.' }
         ],
         links: [
            { type: 'qad.Link', source: { id: '1', port: 'yes' }, target: { id: '2' } },
            { type: 'qad.Link', source: { id: '1', port: 'no' }, target: { id: '3' } }
         ]
      }
    */
    createDialogJSON: function(graph, rootCell) {

        var dialog = {
            root: undefined,
            nodes: [],
            links: []
        };

        _.each(graph.getCells(), function(cell) {

            var o = {
                id: cell.id,
                type: cell.get('type')
            };

            switch (cell.get('type')) {
                case 'qad.Question':
                    o.question = cell.get('question');
                    o.options = cell.get('options');
                    dialog.nodes.push(o);
                    break;
                case 'qad.Answer':
                    o.answer = cell.get('answer');
                    dialog.nodes.push(o);
                    break;
                default: // qad.Link
                    o.source = cell.get('source');
                    o.target = cell.get('target');
                    dialog.links.push(o);
                    break;
            }

            if (!cell.isLink() && !graph.getConnectedLinks(cell, { inbound: true }).length) {
                dialog.root = cell.id;
            }
        });

        if (rootCell) {
            dialog.root = rootCell.id;
        }

        return dialog;
    }
};
