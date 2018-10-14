export interface userLogin {
  /**user name */
  name: string
  /**user password */
  password: string
}

export interface user {
  /**user name */
  name: string
  /**user password */
  password?: string
  /** groups */
  roles? : any[]
}

export interface socketCall {
  reason: string;
  functionName: string,
  params: any,
  id: string;
  user?: user
}