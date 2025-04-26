import { db } from "..";
import { Session, sessionTable } from "../schema/user";

export const createSessionRequest = async (session: Session) => {

    await db.insert(sessionTable).values(session)
}


export const setSessionAs2FAVerified = async (sessionId: string) => {

}

