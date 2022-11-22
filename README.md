# GraphQL-LD querying

This package illustrates a practical approach for federated querying linked data sources using [GraphQL-LD](https://github.com/rubensworks/GraphQL-LD.js) queries.

This practical approach was originally used in the [i-Learn](https://www.i-learn.be/) project, but is set available here as a project-agnostic tool.

## Motivation

This package uses the principles of GraphQL-LD querying using [Comunica](https://comunica.dev/),
and adds the possibility to apply so-called *parametrized queries*.

The usage of *parametrized queries* is inspired by the real life experience collected form the i-Learn project,
where the client application wants to maintain a set of dedicated query prototypes and one fixed context.
Those query prototypes contain parameters (such as a name field or an ID field).
These parameters are substituted at runtime by the values needed at the time of query execution.

That works of the shelf for simple cases where the parameter substitution is a literal, as `"sleutelcompetenties"` in the following example:

- Extract from the query prototype:
```
  prefLabel(_:NAME) @single
```
- After substituting `NAME`:
```
  prefLabel(_:"sleutelcompetenties") @single
```

But... it doesn't work if the parameter substitution is an IRI, as `http://ilearn.ilabt.imec.be/vocab/elem/sleutelcompetenties` in the following example:

- Extract from the query prototype:
```
  id(_:ID) @single
```
- After substituting `ID`:
```
  id(_:http://ilearn.ilabt.imec.be/vocab/elem/sleutelcompetenties) @single
```

> **This does not work, because the syntax does not allow it!**

The solution for this case is to leave the parameter (`ID` in the example) as is in the final query and extend the context to include a line that resolves the parameter.
That extra line for the example:
```
"ID": "http://ilearn.ilabt.imec.be/vocab/elem/sleutelcompetenties"
```
This modifying of the context is not practical from the user point of view, who prefers to use one fixed context at all times.
This package solves this discomfort by providing a *parameter context*, that can be given along with a query.
This parameter context is then merged with the given fixed context and the resulting merged context is forwarded to Comunica, along with the query.

## Installation

Install this npm package globally (to use its command line only)
```
npm install -g @ilearn/graphql-ld-querying
```
or locally as a dependency of your project (to use the Javascript library and optionally also the command line):
```
cd <your-project-dir>
# if not done earlier, do next line now:
npm init
npm install @ilearn/graphql-ld-querying
```

## Usage

The tool can be used [from the command line (CLI)](#cli) or [as a Javascript library](#library).

The parameters for both methods are common and will be discussed [below](#parameters).

For convenient usage of the example files used below, copy or link the package's `examples` directory to your current working directory. Linking example:
```
# For a global installation:
ln -s `npm prefix -g`/lib/node_modules/@ilearn/graphql-ld-querying/examples/ .

# For a local installation:
ln -s node_modules/@ilearn/graphql-ld-querying/examples/ .
```

### CLI

Note: the command `graphql-ld-querying` shown below assumes global installation; for local installation, replace it with `node_modules/.bin/graphql-ld-querying`.

Usage is explained by calling the tool with the `-h` option:
```
graphql-ld-querying -h
Usage: graphql-ld-querying [options]

Options:
  -v, --version                                output the version number
  -c, --config <configuration>                 configuration (as a JSON string or "@" followed by the name of a JSON file)
  -q, --query <query>                          GraphQL-LD query (query string or "@" followed by the name of a file containing a
                                               query string)
  -p, --parameter-context <parameter-context>  JSON-LD context resolving IRI parameters used in the query (JSON-LD string or "@"
                                               followed by the name of a file containing a JSON-LD string)
  -s, --suppress-context                       Suppress "@context" in the answer
  -l, --logLevel <level>                       logging level (choices: "error", "warn", "info", "verbose", "debug", "silly",
                                               default: "info")
  -h, --help                                   display help for command
```

An exhaustive command line example:
```
graphql-ld-querying -c '{
  "dataSources": [
    "examples/1/datasources/ilearn-combined-inferred-v2.ttl"
  ],
  "context": {
    "id": "@id",
    "prefLabel": {"@id": "http://www.w3.org/2004/02/skos/core#prefLabel", "@language": "nl"},
    "member": {"@id": "http://www.w3.org/2004/02/skos/core#member"}
  }
}' -q '{
  id(_:ID) @single
  prefLabel @single
  member @optional {
    id @single
    prefLabel @single
  }
}' -p '{
  "ID": "http://ilearn.ilabt.imec.be/vocab/elem/sleutelcompetenties"
}'
```

A convenient command line example (with parameters read from file):
```
graphql-ld-querying -c @examples/1/config.json -q @examples/1/queries/collection_from_id.gql -p @examples/1/paramContexts/collection_from_id.json
```

### Library

(Code valid when placed in this directory):
```
const {QueryTool} = require('@ilearn/graphql-ld-querying');

async function main() {
  const config = {
    "dataSources": [
      "examples/1/datasources/ilearn-combined-inferred-v2.ttl"
    ],
    "context": {
      "id": "@id",
      "prefLabel": {"@id": "http://www.w3.org/2004/02/skos/core#prefLabel", "@language": "nl"},
      "member": {"@id": "http://www.w3.org/2004/02/skos/core#member"}
    }
  };
  const query = `
{
  id(_:ID) @single
  prefLabel @single
  member @optional {
    id @single
    prefLabel @single
  }
}`;
  const parameterContext = {
    "ID": "http://ilearn.ilabt.imec.be/vocab/elem/sleutelcompetenties"
  };

  // next instance of the tool may be reused for several queries:
  const queryTool = new QueryTool(config);
  
  // one query:
  const result = await queryTool.queryGraphQlLd(query, parameterContext, false);
  
  console.log(JSON.stringify(result, null, 2));
}

main();
```

## Parameters

### config

An object with properties `dataSources` and `context`.

`dataSources`: an array of data sources to be queried. Remote data sources and local files are supported. Local file paths are relative to the working directory.

`context`: a [JSON-LD context](https://www.w3.org/TR/json-ld11/#the-context).

### query

A string according to [the syntax for GraphQL-LD queries](https://github.com/rubensworks/GraphQL-LD.js).

### parameterContext

Only required if the query contains one or more elements that are not defined in the context but represent IRIs.

A `parameterContext` is needed with this query:
```
{
  id(_:ID) @single
  prefLabel @single
  member @optional {
    id @single
    prefLabel @single
  }
}
```
because the element in this query (`ID`) represents an IRI. An accompanying `parameterContext` resolves this `ID`. An example value:
```
{
  "ID": "http://ilearn.ilabt.imec.be/vocab/elem/sleutelcompetenties"
}
```

### suppressContext

If `false`, the result of a query is a self-contained, complete JSON-LD document of this form:
```
{
  "@context":
    ...,
  "@graph": [
    ...
  ]
}  
```

If the caller only needs the `"@graph"` property, the `suppressContext` parameter can be set to `true`.
In that case the `"@context"` property will be omitted from the result.

## Examples

The package's `examples` directory contains example configurations, queries and parameterContexts.




