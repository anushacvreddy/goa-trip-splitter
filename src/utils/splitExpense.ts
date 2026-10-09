
export function splitEqually(
  amountPaise: number,
  memberIds: string[],
): Record<string, number> {
  if (memberIds.length === 0) {
    throw new Error("At least one member is required.");
  }

  const baseShare = Math.floor(amountPaise / memberIds.length);
  const extraPaise = amountPaise % memberIds.length;

  const shares: Record<string, number> = {};

  memberIds.forEach((memberId, index) => {
    shares[memberId] = baseShare + (index < extraPaise ? 1 : 0);
  });

  return shares;
}
