// Cache key of the user's lists. Whoever changes the lists invalidates it, so
// the list screen fetches again the next time it is shown.
export const shopperListsKey = ["shopper-lists"] as const;
