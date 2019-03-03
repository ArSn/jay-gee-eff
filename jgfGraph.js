const check = require('check-types');
const _ = require('lodash');
const { cloneObject } = require('./common');

/**
 * A single JGF graph instance, always contained in a parent JGFContainer
 */
class JGFGraph {

    /**
     * Constructor
     * @param {*} type graph classification
     * @param {*} label a text display for the graph
     * @param {*} directed true for a directed graph, false for an undirected graph
     * @param {*} metadata about the graph
     */
    constructor(type = '', label = '', directed = true, metadata = null) {
        this._nodes = {};
        this._edges = [];

        this._type = type;
        this._label = label;
        this._directed = directed;
        this._metadata = metadata;
        this._isPartial = false;
    }


    /**
     * Loads the graph from a JGF JSON object
     * @param {*} graphJson JGF JSON object
     */
    loadFromJSON(graphJson) {
        this._type = graphJson.type;
        this._label = graphJson.label;
        // todo: this makes the graph always directed (even if false is passed), I doubt that this was the intention here
        this._directed = graphJson.directed || true;
        this._metadata = graphJson.metadata;

        this._nodes = {};
        this._edges = [];
        this.addNodes(graphJson.nodes);
        this.addEdges(graphJson.edges);
    }

    /**
     * Returns the isPartial flag
     */
    get isPartial() {
        return this._isPartial;
    }

    /**
     * Set the _isPartial flag
     */
    set isPartial(value) {
        this._isPartial = value;
    }

    /**
     * Returns the graph type
     */
    get type() {
        return this._type;
    }

    /**
     * Set the graph type
     */
    set type(value) {
        this._type = value;
    }

    /**
     * Returns the graph label
     */
    get label() {
        return this._label;
    }

    /**
     * Set the graph label
     */
    set label(value) {
        this._label = value;
    }

    /**
     * Returns the graph meta data
     */
    get metadata() {
        return this._metadata;
    }

    /**
     * Set the graph meta data
     */
    set metadata(value) {
        this._metadata = value;
    }

    /**
     * Returns all nodes
     */
    get nodes() {
        return cloneObject(Object.values(this._nodes));
    }

    /**
     * Returns all edges
     */
    get edges() {
        return cloneObject(this._edges);
    }


    /**
     * Returns the graph as JGF Json
     */
    get json() {
        let json = {
            type: this._type,
            label: this._label,
            directed: this._directed,
            metadata: {},
            nodes: [],
            edges: [],
        };

        if (check.assigned(this._metadata)) {
            json.metadata = this._metadata;
        }

        if (this._isPartial) {
            json.metadata.isPartial = this._isPartial;
        }

        if (_.isEmpty(json.metadata)) {
            Reflect.deleteProperty(json, 'metadata');
        }

        if (check.assigned(this._nodes) && Object.keys(this._nodes).length > 0) {
            json.nodes = Object.values(this._nodes);
        }

        if (check.assigned(this._edges) && this._edges.length > 0) {
            json.edges = this._edges;
        }

        return cloneObject(json);
    }


    /**
     * Adds a new node
     * @param {*} id Node id
     * @param {*} label Node label
     * @param {*} metadata about the node
     */
    addNode(id, label, metadata = null) {
        if (id in this._nodes) {
            throw new Error(`A node already exists with id = ${id}`);
        }

        let newNode = {
            id,
            label,
        };

        if (check.assigned(metadata)) {
            newNode.metadata = metadata;
        }

        this._nodes[newNode.id] = newNode;
    }


    /**
     * Adds multiple nodes
     * @param {*} nodes A collection of JGF node objects
     */
    addNodes(nodes) {
        for (let { id, label, metadata } of nodes) {
            this.addNode(id, label, metadata);
        }
    }


    /**
     * Updates an existing node
     * @param {*} nodeId Node id
     * @param {*} label Updated node label
     * @param {*} metadata Updated node meta data
     */
    updateNode(nodeId, label, metadata = null) {
        if (!(nodeId in this._nodes)) {
            throw new Error(`Can't update node. A node doesn't exist with id = ${nodeId}`);
        }

        let node = this._nodes[nodeId];

        if (check.assigned(label)) {
            node.label = label;
        }

        if (check.assigned(metadata)) {
            node.metadata = metadata;
        }
    }


    /**
     * Removes an existing graph node
     * @param {*} nodeId Node unique id
     */
    removeNode(nodeId) {
        if (!(nodeId in this._nodes)) {
            throw new Error(`A node doesn't exist with id = ${nodeId}`);
        }

        Reflect.deleteProperty(this._nodes, nodeId);
    }

    /**
     * Lookup a node by a node id
     * @param {*} nodeId Unique node id
     */
    getNode(nodeId) {
        if (!(nodeId in this._nodes)) {
            throw new Error(`A node doesn't exist with id = ${nodeId}`);
        }

        return cloneObject(this._nodes[nodeId]);
    }

    /**
     * Adds an edge between a source node and a target node
     * @param {*} source Source node id
     * @param {*} target Target node id
     * @param {*} relation Edge relation (AKA 'relationship type')
     * @param {*} label Edge label (the display name of the edge)
     * @param {*} metadata Custom edge meta data
     * @param {*} directed true for a directed edge, false for undirected
     */
    addEdge(source, target, relation = null, label = null, metadata = null, directed = null) {
        if (!source) {
            throw new Error('addEdge failed: source parameter is not valid');
        }

        if (!target) {
            throw new Error('addEdge failed: target parameter is not valid');
        }

        if (!this._isPartial) {
            // Validate that the edge's nodes exist
            if (!(source in this._nodes)) {
                throw new Error(`addEdge failed: source node isn't found in nodes. source = ${source}`);
            }

            if (!(target in this._nodes)) {
                throw new Error(`addEdge failed: target node isn't found in nodes. target = ${target}`);
            }
        }

        let edge = {
            source,
            target,
        };
        if (check.assigned(relation)) {
            edge.relation = relation;
        }
        if (check.assigned(label)) {
            edge.label = label;
        }
        if (check.assigned(metadata)) {
            edge.metadata = metadata;
        }
        if (check.assigned(directed)) {
            edge.directed = directed;
        }

        this._edges.push(edge);
    }


    /**
     * Adds multiple edges
     * @param {*} edges A collection of JGF edge obejcts
     */
    addEdges(edges) {
        if (edges) {
            for (let edge of edges) {
                this.addEdge(edge.source, edge.target, edge.relation, edge.label, edge.metadata, edge.directed);
            }
        }
    }

    /**
     * Checks whether the passed edge is equal to an edge with all other three passed params.
     * @param {*} edge
     * @param {*} source Source node id
     * @param {*} target Target node id
     * @param {*} relation Specific edge relation type to remove. If empty then all edges will be removed, regardless of their relation
     */
    static _isEdgeEqual(edge, source, target, relation) {
        return edge.source === source &&
            edge.target === target &&
            (relation === '' || edge.relation === relation);
    }

    /**
     * Removes existing graph edges
     * @param {*} source Source node id
     * @param {*} target Target node id
     * @param {*} relation Specific edge relation type to remove. If empty then all edges will be removed, regardless of their relation
     */
    removeEdges(source, target, relation = '') {
        _.remove(this._edges, (edge) => JGFGraph._isEdgeEqual(edge, source, target, relation));
    }

    /**
     * Get edges between source node and target node, with an optional edge relation
     * @param {*} source
     * @param {*} target
     * @param {*} relation
     */
    getEdges(source, target, relation = '') {
        if (!this.isPartial) {
            if (!(source in this._nodes)) {
                throw new Error(`A node doesn't exist with id = ${source}`);
            }

            if (!(target in this._nodes)) {
                throw new Error(`A node doesn't exist with id = ${target}`);
            }
        }

        let edges = _.filter(this._edges, (edge) => JGFGraph._isEdgeEqual(edge, source, target, relation));

        return cloneObject(edges);
    }

    get graphDimensions() {
        let dimensions = {
            nodes: 0,
            edges: 0,
        };

        dimensions.nodes = Object.keys(this._nodes).length;
        dimensions.edges = this._edges.length;

        return dimensions;
    }
}

module.exports = {
    JGFGraph,
};