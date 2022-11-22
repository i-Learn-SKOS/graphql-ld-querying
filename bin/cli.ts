#!/usr/bin/env node

import pjson from "../package.json";
import { program , Option } from 'commander';
import { logger } from "../lib/logger";
import {QueryTool} from '../lib/query-tool';

import fs from 'fs';

function parse(s = "", json = false) {
  let text;
  if (s.startsWith("@")) {
    text = fs.readFileSync(s.substring(1), 'utf8');
  } else {
    text = s;
  }
  if (json) {
    return JSON.parse(text);
  } else {
    return text;
  }
}

async function main() {
  program
    .version('v' + pjson.version, '-v, --version')
    .requiredOption('-c, --config <configuration>', 'configuration (as a JSON string or "@" followed by the name of a JSON file)')
    .requiredOption('-q, --query <query>', 'GraphQL-LD query (query string or "@" followed by the name of a file containing a query string)')
    .option('-p, --parameter-context <parameter-context>', 'JSON-LD context resolving IRI parameters used in the query (JSON-LD string or "@" followed by the name of a file containing a JSON-LD string)')
    .option('-s, --suppress-context', 'Suppress "@context" in the answer')
    .addOption(new Option("-l, --logLevel <level>", "logging level").choices(["error", "warn", "info", "verbose", "debug", "silly"]).default("info"))
    .parse(process.argv);
  const options = program.opts();

  logger.level = options.logLevel;

  const config = parse(options.config, true);
  const query = parse(options.query, false);
  const parameterContext = options.hasOwnProperty("parameterContext") ? parse(options.parameterContext, true) : {};

  const queryTool = new QueryTool(config);
  const result = await queryTool.queryGraphQlLd(query, parameterContext, options.suppressContext);
  logger.info(`Result:\n${JSON.stringify(result, null, 2)}`);
}

main();

