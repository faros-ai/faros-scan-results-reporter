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

const result = {
  check_id:
    "javascript.ajv.security.audit.ajv-allerrors-true.ajv-allerrors-true",
  end: { col: 39, line: 23, offset: 986 },
  extra: {
    engine_kind: "OSS",
    fingerprint:
      "abea3602d0c2f6bd9b2776c108c5718cb480dc51b9497d9ce8cce944953d8237a30e5905a040bc46a93a403198f9af741035ab8eb555762c70f0f17222ef3887_0",
    is_ignored: false,
    lines: "const ajv = new Ajv({allErrors: true});",
    message:
      "By setting `allErrors: true` in `Ajv` library, all error objects will be allocated without limit. This allows the attacker to produce a huge number of errors which can lead to denial of service. Do not use `allErrors: true` in production.",
    metadata: {
      category: "security",
      confidence: "LOW",
      cwe: ["CWE-400: Uncontrolled Resource Consumption"],
      "cwe2022-top25": true,
      impact: "LOW",
      license: "Commons Clause License Condition v1.0[LGPL-2.1-only]",
      likelihood: "LOW",
      references: ["https://ajv.js.org/options.html#allerrors"],
      "semgrep.dev": {
        rule: {
          origin: "community",
          rule_id: "PeUo5X",
          url: "https://semgrep.dev/playground/r/YDTp2LQ/javascript.ajv.security.audit.ajv-allerrors-true.ajv-allerrors-true",
          version_id: "YDTp2LQ",
        },
      },
      shortlink: "https://sg.run/d2jY",
      source:
        "https://semgrep.dev/r/javascript.ajv.security.audit.ajv-allerrors-true.ajv-allerrors-true",
      subcategory: ["audit"],
      technology: ["ajv"],
      vulnerability_class: ["Denial-of-Service (DoS)"],
    },
    metavars: {},
    severity: "WARNING",
    validation_state: "NO_VALIDATOR",
  },
  path: "packages/common/src/userEvent/types/index.ts",
  start: { col: 13, line: 23, offset: 960 },
};


// "Code quality category"
// enum qa_CodeQualityCategory {
//   Complexity
//   Coverage
//   Duplications
//   Maintainability
//   Reliability
//   Security
//   SecurityReview
//   Custom
// }

// "Type for a code quality metric value"
// enum qa_CodeQualityMetricType {
//   Bool
//   Float
//   Int
//   Percent
//   String
// }

// "Code quality measure for a metric"
// type qa_CodeQualityMeasure {
//   category: qa_CodeQualityCategory
//   name: String
//   type: qa_CodeQualityMetricType
//   value: String
// }

// "Code quality definition"
// type qa_CodeQuality @model(key: ["uid"]) {
//   uid: ID
//   bugs: qa_CodeQualityMeasure
//   branchCoverage: qa_CodeQualityMeasure
//   codeSmells: qa_CodeQualityMeasure
//   complexity: qa_CodeQualityMeasure
//   coverage: qa_CodeQualityMeasure
//   duplications: qa_CodeQualityMeasure
//   duplicatedBlocks: qa_CodeQualityMeasure
//   lineCoverage: qa_CodeQualityMeasure
//   securityHotspots: qa_CodeQualityMeasure
//   vulnerabilities: qa_CodeQualityMeasure
//   createdAt: Timestamp

//   "Pull request associated with this code quality"
//   pullRequest: vcs_PullRequest @reference(back: "codeQuality")

//   "Repository associated with this code quality"
//   repository: vcs_Repository @reference(back: "codeQuality")

//   "Application associated with this code quality"
//   application: compute_Application @reference(back: "codeQuality")
// }


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
