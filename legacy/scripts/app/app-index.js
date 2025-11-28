import { initCommonLayout } from '../common.js'
import { initPostsPage } from '../post/posts.js';

document.addEventListener('DOMContentLoaded', async () => {
    initCommonLayout();
    await initPostsPage();
});