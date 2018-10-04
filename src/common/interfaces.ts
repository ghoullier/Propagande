interface userLogin {
  /**user name */
  name: string
  /**user password */
  password: string
}

interface user {
  /**user name */
  name: string
  /**user password */
  password?: string
  /** groups */
  roles? : any[]
}

interface socketCall {
  reason: string;
  functionName: string,
  params: any,
  id: string;
  user?: user
}