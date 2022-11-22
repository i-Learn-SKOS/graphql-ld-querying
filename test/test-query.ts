import { expect } from 'chai';
import { IConfig, IQueryResult, IDataSource, QueryTool } from '../lib/query-tool';

describe('Query', function () {
  const oneDataSource:[IDataSource, ...IDataSource[]] = [
    "test/data/ilearn-curr1-v2.ttl"];
  const twoDataSources:[IDataSource, ...IDataSource[]] = [
    "test/data/ilearn-curr1-v2.ttl",
    "test/data/ilearn-curr2-v2.ttl"];
  const threeDataSources:[IDataSource, ...IDataSource[]] = [
    "test/data/ilearn-curr1-v2.ttl",
    "test/data/ilearn-curr2-v2.ttl",
    "test/data/ilearn-elem-v2.ttl"];
  const commonContext = {
    "id": "@id",
    "TYPE": {"@id": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"},
    "Collection": {"@id": "http://www.w3.org/2004/02/skos/core#Collection"},
    "Concept": {"@id": "http://www.w3.org/2004/02/skos/core#Concept"},
    "member": {"@id": "http://www.w3.org/2004/02/skos/core#member"}
  }

  function checkResultWithGraph(result:IQueryResult, length: number) {
    expect(result).to.be.an("object");
    expect(result).to.haveOwnProperty("@graph");
    expect(result["@graph"]).to.be.an("Array");
    expect(result["@graph"].length).to.equal(length);
  }

  describe('concepts', function () {
    it('one datasource', async function () {
      const config:IConfig = {
        "dataSources": oneDataSource,
        "context": commonContext
      };
      const query = `
{
  TYPE(_:Concept)
  id @single
}`;
      const queryTool = new QueryTool(config);
      const result = await queryTool.queryGraphQlLd(query);
      checkResultWithGraph(result, 79);
    });
    it('two data sources', async function () {
      const config = {
        "dataSources": twoDataSources,
        "context": commonContext
      };
      const query = `
{
  TYPE(_:Concept)
  id @single
}`;
      const queryTool = new QueryTool(config);
      const result = await queryTool.queryGraphQlLd(query);
      checkResultWithGraph(result, 157);
    });
  });

  describe('collections', function () {
    it('all', async function () {
      const config = {
        "dataSources": threeDataSources,
        "context": commonContext
      };
      const query = `
{
  TYPE(_:Collection)
  id @single
}`;
      const queryTool = new QueryTool(config);
      const result = await queryTool.queryGraphQlLd(query);
      checkResultWithGraph(result, 9);
    });
    it('one with its members', async function () {
      const config = {
        "dataSources": threeDataSources,
        "context": commonContext
      };
      const query = `
{
  id(_:A_CERTAIN_COLLECTION_ID) @single
  member @optional
}`;
      const parameterContext = {
        "A_CERTAIN_COLLECTION_ID": "http://ilearn.ilabt.imec.be/vocab/elem/sleutelcompetenties"
      };
      const queryTool = new QueryTool(config);
      const result = await queryTool.queryGraphQlLd(query, parameterContext);
      checkResultWithGraph(result, 1);
      expect(result["@graph"][0]).to.haveOwnProperty("member");
      // Typescript doesn't know there is a .member, but we know...
      // @ts-ignore
      expect(result["@graph"][0].member).to.be.an("Array");
      // Typescript doesn't know there is a .member, but we know...
      // @ts-ignore
      expect(result["@graph"][0].member.length).to.equal(17);
    });
  });

  describe('suppress context', function () {
    it('default', async function () {
      const config = {
        "dataSources": threeDataSources,
        "context": commonContext
      };
      const query = `
{
  TYPE(_:Collection)
  id @single
}`;
      const queryTool = new QueryTool(config);
      // default
      const resultDefault = await queryTool.queryGraphQlLd(query);
      checkResultWithGraph(resultDefault, 9);
      expect(resultDefault).to.haveOwnProperty("@context");
      expect(resultDefault["@context"]).to.equal(config.context);
      // on
      const resultOn= await queryTool.queryGraphQlLd(query, undefined, true);
      checkResultWithGraph(resultOn, 9);
      expect(resultOn).to.not.haveOwnProperty("@context");
      // off
      const resultOff = await queryTool.queryGraphQlLd(query, undefined, false);
      checkResultWithGraph(resultOff, 9);
      expect(resultOff["@context"]).to.equal(config.context);
    });
  });
});
