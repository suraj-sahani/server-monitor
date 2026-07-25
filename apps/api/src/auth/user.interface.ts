export interface IUserCtx {
  id: string;
  name: string;
  email: string;
}

export interface RequestWithUser extends Request {
  user: IUserCtx;
}
