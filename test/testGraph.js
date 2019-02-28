const { assert } = require('chai');
const { JGFContainer } = require('../jgfContainer');
const simple = require('simple-mock');

describe('Graph', () => {
    describe('#add graph node', () => {
        it('should add a simple node to a graph', () => {
            let container = new JGFContainer(singleGraph = true);
            let graph = container.graph;

            const nodeId = 'lebron-james#2254';
            const nodeLabel = 'LeBron James';

            graph.addNode(nodeId, nodeLabel);
            assert.equal(1, graph.nodes.length);
            assert.equal(nodeId, graph.nodes[0].id);
            assert.equal(nodeLabel, graph.nodes[0].label);
        })

        it('should add a node to a graph, with meta data', () => {
            let container = new JGFContainer(singleGraph = true);
            let graph = container.graph;

            const nodeId = 'kevin-durant#4497';
            const nodeLabel = 'Kevin Durant';

            const metadata = {
                type: 'NBAPlayer',
                position: 'Power Forward',
                shirt: 35
            };

            graph.addNode(nodeId, nodeLabel, metadata);
            assert.equal(1, graph.nodes.length);
            assert.equal('Power Forward', graph.nodes[0].metadata.position);
            assert.equal(35, graph.nodes[0].metadata.shirt);
        })


        it('should throw an exception when adding a node that already exists', () => {
            let container = new JGFContainer(singleGraph = true);
            let graph = container.graph;

            const nodeId = 'kevin-durant#4497';
            const nodeLabel = 'Kevin Durant';

            graph.addNode(nodeId, nodeLabel);

            assert.throw(() => graph.addNode(nodeId, nodeLabel), Error, 'A node already exists');
        })

        it('should throw an exception when adding nodes that already exist', () => {
            let container = new JGFContainer(singleGraph = true);
            let graph = container.graph;

            const nodeId = 'kevin-durant#4497';
            const nodeLabel = 'Kevin Durant';

            graph.addNode(nodeId, nodeLabel);

            const moreNodes = [
                {
                    id: 'kevin-durant#4497',
                    label: 'Kevin Durant'
                },
                {
                    id: 'kyrie-irving#9876',
                    label: 'Kyrie Irving'
                }
            ];

            assert.throw(() => graph.addNodes(moreNodes), Error, 'A node already exists');
        })

    })

    describe('#update graph node', () => {
        it('should update a node\'s label', () => {
            let container = new JGFContainer(singleGraph = true);
            let graph = container.graph;

            const nodeId = 'kevin-love#0000';
            const nodeLabel = 'Kevin Lofe';

            graph.addNode(nodeId, nodeLabel);
            const correctLabel = 'Kevin Love';
            graph.updateNode(nodeId, correctLabel);
            assert.equal(correctLabel, graph.nodes[0].label);
        })

    })

    describe('#removeNode', () => {
        it('should remove a node', () => {
            let container = new JGFContainer(singleGraph = true);
            let graph = container.graph;

            const nodeId = 'kevin-durant#4497';
            const nodeLabel = 'Kevin Durant';

            graph.addNode(nodeId, nodeLabel);

            graph.removeNode(nodeId);
            assert.equal(0, graph.nodes.length, 'After removeNode there should be zero nodes');
        })

        it('should throw an exception when removing a non existant node', () => {
            let container = new JGFContainer(singleGraph = true);
            let graph = container.graph;

            assert.throws(() => graph.removeNode('some dummy id'), 'A node doesn\'t exist');
        })
    })

    describe('#getNode', () => {
        it('should lookup a node by id', () => {
            let container = new JGFContainer(singleGraph = true);
            let graph = container.graph;

            const nodeId = 'kevin-durant#4497';
            const nodeLabel = 'Kevin Durant';

            graph.addNode(nodeId, nodeLabel);

            let node = graph.getNode(nodeId);
            assert(node !== null);
            assert(node.id === nodeId);
        })

        it('should throw an exception when looking up a non existant node', () => {
            let container = new JGFContainer(singleGraph = true);
            let graph = container.graph;

            assert.throws(() => graph.getNode('some dummy id'), 'A node doesn\'t exist');
        })
    })

    describe('#addGraphEdge', () => {
        it('should add a simple edge to a graph', () => {
            let container = new JGFContainer(singleGraph = true);
            let graph = container.graph;

            const node1Id = 'lebron-james#2254';
            const node1Label = 'LeBron James';

            const node2Id = 'la-lakers#1610616839';
            const node2Label = 'Los Angeles Lakers';

            const playerContractRelation = 'Plays for';

            graph.addNode(node1Id, node1Label);
            graph.addNode(node2Id, node2Label);

            assert.equal(2, graph.nodes.length);

            graph.addEdge(node1Id, node2Id, playerContractRelation);

            assert.equal(1, graph.edges.length);
            assert.equal(playerContractRelation, graph.edges[0].relation);
        })
    })

    describe('#addGraphEdges', () => {
        it('should not call addEdge if no edges are passed', () => {
            let container = new JGFContainer();
            let graph = container.graph;

            let fn = simple.mock(graph, 'addEdge').callOriginal();

            graph.addEdges([]);

            assert.equal(fn.callCount, 0);
        })

        it('should call addEdge with parameters if edges are passed', () => {
            let container = new JGFContainer();
            let graph = container.graph;

            let fn = simple.mock(graph, 'addEdge').callFn(function () {});

            graph.addEdges([
                {
                    source: 'firstSource',
                    target: 'targetOne',
                    relation: 'firstRelation',
                    label: 'labelOne',
                    metadata: 'someMetaData',
                    directed: true,
                },
                {
                    source: 'secondSource',
                    target: 'targetTwo',
                    relation: 'secondRelation',
                    label: 'labelTwo',
                    metadata: 'someMoreMetaData',
                    directed: false,
                }
            ]);

            assert.equal(fn.callCount, 2);

            assert.equal(fn.calls[0].args[0], 'firstSource');
            assert.equal(fn.calls[0].args[1], 'targetOne');
            assert.equal(fn.calls[0].args[2], 'firstRelation');
            assert.equal(fn.calls[0].args[3], 'labelOne');
            assert.equal(fn.calls[0].args[4], 'someMetaData');
            assert.equal(fn.calls[0].args[5], true);

            assert.equal(fn.calls[1].args[0], 'secondSource');
            assert.equal(fn.calls[1].args[1], 'targetTwo');
            assert.equal(fn.calls[1].args[2], 'secondRelation');
            assert.equal(fn.calls[1].args[3], 'labelTwo');
            assert.equal(fn.calls[1].args[4], 'someMoreMetaData');
            assert.equal(fn.calls[1].args[5], false);

        })

        it('should add partial graph edges', () => {
            let container = new JGFContainer(singleGraph = true);
            let graph = container.graph;
            graph.isPartial = true;

            const node1Id = 'lebron-james#2544';
            const node1Label = 'LeBron James';

            const partialNode2Id = 'la-lakers#1610616839';

            const playerContractRelation = 'Plays for';

            graph.addNode(node1Id, node1Label);
            graph.addEdge(node1Id, partialNode2Id, playerContractRelation);

            let edges = graph.edges;
            assert(edges !== null);
            assert.equal(1, edges.length);
        })
    })

    describe('#removeEdges', () => {
        it('should remove a graph edge', () => {
            let container = new JGFContainer(singleGraph = true);
            let graph = container.graph;

            const node1Id = 'lebron-james#2254';
            const node1Label = 'LeBron James';

            const node2Id = 'la-lakers#1610616839';
            const node2Label = 'Los Angeles Lakers';

            const playerContractRelation = 'Plays for';

            graph.addNode(node1Id, node1Label);
            graph.addNode(node2Id, node2Label);
            graph.addEdge(node1Id, node2Id, playerContractRelation);

            graph.removeEdges(node1Id, node2Id, playerContractRelation);
            assert.equal(0, graph.edges.length, 'After removeEdges there should be zero edges');
        })
    })

    describe('#getEdges', () => {
        it('should lookup edges', () => {
            let container = new JGFContainer(singleGraph = true);
            let graph = container.graph;

            const node1Id = 'lebron-james#2254';
            const node1Label = 'LeBron James';

            const node2Id = 'la-lakers#1610616839';
            const node2Label = 'Los Angeles Lakers';

            const playerContractRelation = 'Plays for';

            graph.addNode(node1Id, node1Label);
            graph.addNode(node2Id, node2Label);
            graph.addEdge(node1Id, node2Id, playerContractRelation);

            let edges = graph.getEdges(node1Id, node2Id, playerContractRelation);
            assert(edges !== null);
            assert.equal(1, edges.length);
        })

        it('should throw error if source or target node does not exist and graph is not partial', () => {
            let container = new JGFContainer();
            let graph = container.graph;

            const node1Id = 'lebron-james#2254';
            const node1Label = 'LeBron James';

            const node2Id = 'la-lakers#1610616839';
            const node2Label = 'Los Angeles Lakers';

            const playerContractRelation = 'Plays for';

            graph.addNode(node1Id, node1Label);
            graph.addNode(node2Id, node2Label);
            graph.addEdge(node1Id, node2Id, playerContractRelation);

            assert.throws(() => { graph.getEdges('lebron-james#2254-nonsense', node2Id, playerContractRelation) }, Error);
            assert.throws(() => { graph.getEdges(node1Id, 'la-lakers#1610616839-nonsense', playerContractRelation) }, Error);
        })

        xit('should return partial edges if graph is partial', () => {
            let container = new JGFContainer();
            let graph = container.graph;
            graph.isPartial = true;

            const node1Id = 'lebron-james#2254';
            const node1Label = 'LeBron James';

            const node2Id = 'la-lakers#1610616839';
            const node2Label = 'Los Angeles Lakers';

            const playerContractRelation = 'Plays for';

            graph.addNode(node1Id, node1Label);
            graph.addNode(node2Id, node2Label);
            graph.addEdge(node1Id, node2Id, playerContractRelation);

            // todo: this does not yet return partial edges if there are any, functionality missing
            let edges = graph.getEdges('lebron-james#2254-nonsense', node2Id, playerContractRelation);
            assert(edges !== null);
            assert.equal(1, edges.length);
        })
    })

    describe('#graphDimensions', () => {
        it('should return zero dimensions for an empty graph', () => {
            let container = new JGFContainer(singleGraph = true);
            let graph = container.graph;

            let dimensions = graph.graphDimensions;
            assert.equal(0, dimensions.nodes);
            assert.equal(0, dimensions.edges);
        })


        it('should return valid dimensions for a non-empty graph', () => {
            let container = new JGFContainer(singleGraph = true);
            let graph = container.graph;

            graph.addNode('node1', 'nodeTypeA');
            graph.addNode('node2', 'nodeTypeB');
            graph.addEdge('node1', 'node2', 'edgeTypeC');

            let dimensions = graph.graphDimensions;
            assert.equal(2, dimensions.nodes);
            assert.equal(1, dimensions.edges);
        })
    })

});