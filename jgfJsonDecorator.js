const _ = require('deepdash')(require('lodash'));
const check = require('check-types');
const { JgfGraph } = require('./jgfGraph');
const { JgfMultiGraph } = require('./jgfMultiGraph');

/**
 * Transforms graphs or multigraphs to json or vice versa.
 *
 * Note that this is just called decorator for semantic reasons and does not follow the GoF decorator design pattern.
 */
class JgfJsonDecorator {

    // static fromJson(json) {
    //     // todo: return graph or multigraph depending on data
    // }

    static _guardAgainstInvalidGraphObject(graph) {
        if (!check.instance(graph, JgfGraph) && !check.instance(graph, JgfMultiGraph)) {
            throw new Error('JgfJsonDecorator can only decorate graphs or multigraphs.');
        }
    }

    /**
     * Transforms either a graph or a multigraph object to a JSON representation as per the spec.
     * @param {JgfGraph,JgfMultiGraph} graph
     * @returns {object}
     */
    static toJson(graph) {
        this._guardAgainstInvalidGraphObject(graph);

        const isSingleGraph = check.instance(graph, JgfGraph);

        let normalizedGraph = this._normalizeToMultiGraph(graph);
        let allGraphsJson = {
            graphs: [],
        };

        _.each(normalizedGraph.graphs, (singleGraph) => {

            let singleGraphJson = {
                type: singleGraph.type,
                label: singleGraph.label,
                directed: singleGraph.directed,
                metadata: singleGraph.metadata,
                nodes: [],
                edges: [],
            };

            this._nodesToJson(singleGraph, singleGraphJson);
            this._edgesToJson(singleGraph, singleGraphJson);

            allGraphsJson.graphs.push(singleGraphJson);
        });

        if (isSingleGraph) {
            return this._removeNullValues({ graph: allGraphsJson.graphs[0] });
        }

        return this._removeNullValues(allGraphsJson);
    }

    static _removeNullValues(json) {
        return _.filterDeep(json, (value) => value !== null);
    }

    /**
     * @param {JgfGraph} graph
     * @param {object} json
     */
    static _edgesToJson(graph, json) {
        _.each(graph.edges, (edge) => {
            json.edges.push({
                source: edge.source,
                target: edge.target,
                relation: edge.relation,
                label: edge.label,
                metadata: edge.metadata,
                directed: edge.directed,
            });
        });
    }

    /**
     * @param {JgfGraph} graph
     * @param {object} json
     */
    static _nodesToJson(graph, json) {
        _.each(graph.nodes, (node) => {
            json.nodes.push({
                id: node.id,
                label: node.label,
                metadata: node.metadata,
            });
        });
    }

    static _normalizeToMultiGraph(graph) {
        let normalizedGraph = graph;
        if (check.instance(graph, JgfGraph)) {
            normalizedGraph = new JgfMultiGraph();
            normalizedGraph.addGraph(graph);
        }

        return normalizedGraph;
    }
}

module.exports = {
    JgfJsonDecorator,
};