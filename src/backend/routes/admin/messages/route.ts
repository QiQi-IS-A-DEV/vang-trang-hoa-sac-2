import 'server-only';
// Message moderation is outside the agreed business scope.
export async function DELETE() { return Response.json({error:'Chức năng này không được hỗ trợ.'},{status:405}); }
