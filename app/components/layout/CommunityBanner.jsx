import { memo } from 'react';

export const CommunityBanner = memo(function() {
  return (
    <section className="community-banner">
      <div className="banner__content">
        <div className="banner__title">하루 조각</div>
        <div className="banner__subtitle">함께 만드는 조각 모음</div>
      </div>
    </section>
  );
});
