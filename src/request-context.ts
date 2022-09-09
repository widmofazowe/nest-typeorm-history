import { Request, Response } from 'express';

import * as cls from 'cls-hooked';

interface CurrentUser {
  id: string;
}

const NSID = 'history-request-context';

export class RequestContext {
  public static nsid = NSID;
  public readonly id: number;
  public request: Request;
  public response: Response;

  constructor(request: Request, response: Response) {
    this.id = Math.random();
    this.request = request;
    this.response = response;
  }

  public static currentRequestContext() {
    const session = cls.getNamespace(RequestContext.nsid);
    if (session && session.active) {
      return session.get(RequestContext.name);
    }

    return null;
  }

  public static currentRequest() {
    const requestContext = RequestContext.currentRequestContext();

    if (requestContext) {
      return requestContext.request;
    }

    return null;
  }

  public static currentUser() {
    const requestContext = RequestContext.currentRequestContext();

    if (requestContext) {
      const user: any = requestContext.request['user'];
      if (user) {
        return user as CurrentUser;
      }
    }

    return null;
  }
}
