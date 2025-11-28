import { initPostPage } from '../post/post.js'
import { getParam } from '../util.js';
import { initCommonLayout } from '../common.js';

document.addEventListener('DOMContentLoaded', async () => {
    const postId = getParam("postId");
    if (!postId) {
        alert("존재하지 않은 게시글 입니다.")
        window.location.replace("/index.html");
        return
    }
    initCommonLayout();
    await initPostPage(postId);
});
