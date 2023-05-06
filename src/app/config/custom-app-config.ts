export interface ICustomAppConfig {
  appCode: string
}

export interface IProgramInfo {
  [key: string]: IProgramInfoParams
}

export interface IProgramInfoParams {
  sourceRoot: string
  type: string
  jsonPath: string
  description?: string
}

export const CUSTOM_APP_CONFIG: ICustomAppConfig = {
  appCode: ''
};

export const programs: IProgramInfo = {
};
