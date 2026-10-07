// WHO IS WORKING THE SCREENS — until the session carries a name.
//
// Held in the data layer, not in `claim-store`, because the SEED needs it too:
// part of the claims history on file was processed by this user, and a seed
// that named someone else would leave their history empty on every load.
// `claim-store` stamps every action with it; the seed stamps headers with it.
//
// Replace with the signed-in user's name the day the session has one.
export const CURRENT_USER = "Jimwell Ocsio";
