exports.processImage = functions.storage.object().onFinalize(async (object) => {
  // 이미지 업로드시 자동 리사이징
});

exports.sendNotification = functions.firestore
  .document('reviews/{reviewId}/comments/{commentId}')
  .onCreate(async (snap, context) => {
    // 새 댓글 작성시 알림 발송
}); 