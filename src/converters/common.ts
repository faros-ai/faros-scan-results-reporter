export interface Config {
  readonly repoInfo?: {
    readonly name: string;
    readonly organization: string;
    readonly source: string;
  };
  readonly pullRequest?: number;
  readonly appInfo?: {
    readonly name: string;
    readonly platform: string;
  };
  readonly createdAt: string;
}
