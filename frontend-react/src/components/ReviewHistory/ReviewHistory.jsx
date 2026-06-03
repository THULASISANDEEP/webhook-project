import "./ReviewHistory.css";

export default function ReviewHistory({ changeStageToReview }) {
  if (!changeStageToReview?.users?.length) return null;

  return (
    <div className="review-history">
      <h4 className="review-history__title">Review History</h4>
      <div className="review-history__date">Date: {changeStageToReview.date}</div>
      {changeStageToReview.users.map((user, index) => (
        <div
          key={index}
          className="review-history__user"
          style={{
            borderBottom:
              index !== changeStageToReview.users.length - 1
                ? "1px solid #ddd"
                : "none",
          }}
        >
          <strong>{user.name}</strong>
          <div className="review-history__user-time">{user.time}</div>
        </div>
      ))}
    </div>
  );
}
