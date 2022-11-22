import { expect } from 'chai';
import { IConfig, QueryTool } from '../lib/query-tool';

describe('Constructor', function () {
  describe('good', function () {
    it('should not throw', function () {
      const config:IConfig = {
        "dataSources": [
          "data/ilearn-elem-v2.ttl"
        ],
        "context": {
          "id": "@id"
        }
      };
      expect(function() {
        new QueryTool(config)
      }).not.to.throw();
    });
  });

  describe('bad', function () {
    it('should throw - no config', function () {
      expect(function () {
        // a test for Javascript users; no Typescript check on this line...
        // @ts-ignore
        new QueryTool(null)
      }).to.throw();
    });
    it('should throw - config not an object', function () {
      expect(function () {
        // a test for Javascript users; no Typescript check on this line...
        // @ts-ignore
        new QueryTool("oops")
      }).to.throw();
    });
    it('should throw - no data sources', function () {
      const config = {
        "context": {
          "id": "@id"
        }
      };
      expect(function () {
        // a test for Javascript users; no Typescript check on this line...
        // @ts-ignore
        new QueryTool(config)
      }).to.throw();
    });
    it('should throw - datas ources not an array', function () {
      const config = {
        "dataSources": {},
        "context": {
          "id": "@id"
        }
      };
      expect(function () {
        // a test for Javascript users; no Typescript check on this line...
        // @ts-ignore
        new QueryTool(config)
      }).to.throw();
    });
    it('should throw - no context', function () {
      const config = {
        "dataSources": [
          "data/ilearn-elem-v2.ttl"
        ]
      };
      expect(function () {
        // a test for Javascript users; no Typescript check on this line...
        // @ts-ignore
        new QueryTool(config)
      }).to.throw();
    });
    it('should throw - context not an object', function () {
      const config = {
        "dataSources": [
          "data/ilearn-elem-v2.ttl"
        ],
        "context": "oops"
      };
      expect(function () {
        // a test for Javascript users; no Typescript check on this line...
        // @ts-ignore
        new QueryTool(config)
      }).to.throw();
    });
    it('should throw - context an array', function () {
      const config = {
        "dataSources": [
          "data/ilearn-elem-v2.ttl"
        ],
        "context": [{
          "id": "@id"
        }]
      };
      expect(function () {
        // a test for Javascript users; no Typescript check on this line...
        // @ts-ignore
        new QueryTool(config)
      }).to.throw();
    });
  });
});
