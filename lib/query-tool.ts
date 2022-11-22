import "process";
import { logger } from './logger';

// GraphQL-LD with Comunica
// see:
//   https://comunica.dev/docs/query/advanced/graphql_ld/
//   ... and convert to Typescript.

import { QueryEngine } from '@comunica/query-sparql-file';
import { bindingsStreamToGraphQl } from '@comunica/actor-query-result-serialize-tree';
import type { BindingsStream } from '@comunica/types';
import type { IDataSource } from '@comunica/types/lib/IDataSource';
import { LoggerPretty } from "@comunica/logger-pretty";


interface IConfig {
    context: object,
    dataSources: [IDataSource, ...IDataSource[]]
}

interface IQueryResult {
    "@context"?: any,
    "@graph": object[]
}

class QueryTool {
    dataSources;
    context;
    comunicaQueryEngine;
    comunicaLogger;

    constructor(config:IConfig) {
        if (!config || typeof(config) !== "object" || Array.isArray(config)) {
            throw new Error("Bad config");
        }
        if (!config.hasOwnProperty("dataSources") || typeof(config.context) !== "object" || !Array.isArray(config.dataSources)) {
            throw new Error("Bad config.dataSources");
        }
        if (!config.hasOwnProperty("context") || typeof(config.context) !== "object" || Array.isArray(config.context)) {
            throw new Error("Bad config.context");
        }
        this.dataSources = config.dataSources;
        this.context = config.context;
        this.comunicaQueryEngine = new QueryEngine();
        this.comunicaLogger = new LoggerPretty({level: 'error'}); // set to info or debug in case of trouble
    }

    /**
     * Executes a GraphQL-LD query
     * @param query a GraphQL-LD query string
     * @param parameterContext JSON-LD context resolving parameter uri's used in the query
     * @param suppressContext when true, @context is not added to the return value
     * @returns {Promise<{"@graph": {[p: string]: any}, "@context": {}}>}
     */
    async queryGraphQlLd(query = "", parameterContext = {}, suppressContext = false): Promise<IQueryResult> {
        let combinedContext = {...this.context, ...parameterContext};
        logger.debug(`Combined context:\n${JSON.stringify(combinedContext, null, 2)}`);
        logger.debug(`Query:\n${query}`);

        const t1 = process.hrtime.bigint();
        const result = await this.comunicaQueryEngine.query(query, {
            sources: this.dataSources,
            queryFormat: {
                language: 'graphql',
                version: '1.0'
            },
            "@context": combinedContext,
            log: this.comunicaLogger
        });
        // Converts raw Comunica results to GraphQL objects
        const data = (await bindingsStreamToGraphQl((await result.execute()) as BindingsStream, result.context, {materializeRdfJsTerms: true})) as object[];
        const t2 = process.hrtime.bigint();
        logger.verbose(`GraphQL LD query executed in ${(t2-t1)/1000000n} milliseconds.`);

        let rv: {[index: string]:any} = {};
        if (!suppressContext) {
            rv["@context"] = this.context;
        }
        rv["@graph"] = data;
        return rv as IQueryResult;
    }
}

export { IConfig, IQueryResult, IDataSource, QueryTool };
