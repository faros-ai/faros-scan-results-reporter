import { Mutation, QueryBuilder } from "faros-js-client";
import { Converter } from "../converter";
import { v4 } from 'uuid';

interface CodeLocation {
  readonly col: number;
  readonly line: number;
  readonly offset: number;
}

interface CodeSpan {
  readonly end: CodeLocation;
  readonly file: string;
  readonly start: CodeLocation;
}

interface ScanError {
  readonly code: number;
  readonly level: string;
  readonly message: string;
  readonly path: string;
  readonly spans: CodeSpan;
}

interface ScanResultExtraMetadata {
  readonly category: string;
  readonly confidence: string;
  readonly cwe: Array<string>;
  readonly "cwe2022-top25": boolean;
  readonly impact: string;
  readonly vulnerability_class: Array<string>;
}

interface ScanResultExtra {
  readonly engine_kind: string;
  readonly fingerprint: string;
  readonly is_ignored: boolean;
  readonly lines: string;
  readonly message: string;
  readonly metadata: ScanResultExtraMetadata;
  readonly severity: string;
}

interface ScanResult {
  readonly check_id: string;
  readonly start: CodeLocation;
  readonly end: CodeLocation;
  readonly extra: ScanResultExtra;
  readonly path: string;
}

interface SemgrepScanOutput {
  readonly errors: Array<ScanError>;
  readonly paths: {
    readonly scanned: Array<string>;
  };
  readonly results: Array<ScanResult>;
}

export class SemgrepConverter extends Converter {
  convert(data: SemgrepScanOutput, qb: QueryBuilder): Array<Mutation> {
    const mutations = [];

    const qa_CodeQuality = {
        uid: v4(),

    }

    for (const result of data?.results ?? []) {



        
    }

    return [];
  }
}

// function makeCodeQualityMeasureBase():{
//     category: string;
//     name: string;
//     type: string;
//     value: string;
// } {
//     return {

//     }
// }
