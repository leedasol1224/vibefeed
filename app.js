// --- app.js ---
// Handles App Logic, LocalStorage State, and UI Updates

const STORAGE_KEY = 'vibefeed_posts';

// Dummy Content representing different WIV participants
const initialPosts = [
    {
        id: 1,
        author: 'Sarah Johnson',
        authorAvatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=FFEAA7&color=333&size=128',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        title: 'Launch Day is Here!',
        content: 'Just finished the first version of my team project! So excited to show it at the WIV buildathon! 🚀 We used HTML, CSS and a lot of caffeine.',
        tag: '#ProjectProgress',
        likes: 12,
        comments: 3,
        isLiked: false,
        timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
        id: 2,
        author: 'Emma Lee',
        authorAvatar: 'https://ui-avatars.com/api/?name=Emma+Lee&background=A8E6CF&color=333&size=128',
        image: '',
        title: 'Mastering CSS Grid',
        content: 'I finally understood how CSS Grid works today. It makes layout so much easier than floating everything! Feeling powerful 💪 Anyone else struggle with this initially?',
        tag: '#TodayILearned',
        likes: 8,
        comments: 5,
        isLiked: true,
        timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
    },
    {
        id: 3,
        author: 'WIV Builder', // current user
        authorAvatar: 'https://ui-avatars.com/api/?name=WIV+Builder&background=FF6B6B&color=fff&size=128',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        title: 'React State Management Help',
        content: 'Does anyone know a good tutorial for React state management? I am struggling a bit right now to wrap my head around it.',
        tag: '#NeedAdvice',
        likes: 4,
        comments: 2,
        isLiked: false,
        timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
        id: 4,
        author: 'Jiwoo Park',
        authorAvatar: 'https://ui-avatars.com/api/?name=Jiwoo+Park&background=ffb3ba&color=333&size=128',
        image: '',
        title: 'Connecting the Backend',
        content: 'We are connecting our frontend to the Firebase backend today! The WIV mentors were super helpful in debugging our auth flow.',
        tag: '#ProjectProgress',
        likes: 15,
        comments: 1,
        isLiked: false,
        timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    {
        id: 5,
        author: 'Minji Kim',
        authorAvatar: 'https://ui-avatars.com/api/?name=Minji+Kim&background=bae1ff&color=333&size=128',
        image: '',
        title: 'Taking Breaks!',
        content: 'Just a reminder to everyone to stay hydrated! Buildathons are a marathon, not a sprint 💧 Good luck with all your projects!',
        tag: '#General',
        likes: 22,
        comments: 4,
        isLiked: true,
        timestamp: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    }
];

// App State
let posts = [];
let currentFilter = 'All';

// DOM DOM Elements Refs
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item, .write-top-btn, .guestbook-top-btn');
const feedContainer = document.getElementById('feed-container');
const profileFeedContainer = document.getElementById('profile-feed-container');
const filterTags = document.querySelectorAll('.filter-tag');

// Form Refs
const writeForm = document.getElementById('write-form');
const postImageInput = document.getElementById('post-image');
const imagePreviewContainer = document.getElementById('image-preview');

// Profile Refs
const profilePostsCount = document.getElementById('profile-posts-count');
const profileLikesCount = document.getElementById('profile-likes-count');

// Init application
function init() {
    loadTheme();
    loadPosts();
    loadMemos();
    setupNavigation();
    setupFilters();
    setupForm();
    setupWriteClose();
    setupThemeToggle();
    setupGuestbook();
    renderFeed();
    renderMemos();
    updateProfileStats();
}

function setupWriteClose() {
    const closeBtn = document.querySelector('.close-write-btn');
    if(closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.nav-item[data-target="view-feed"]').click();
        });
    }
}

// -----------------------
// Theme Management
// -----------------------

function loadTheme() {
    const savedTheme = localStorage.getItem('vibefeed_theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

function setupThemeToggle() {
    const themeBtn = document.querySelector('.theme-toggle-btn');
    if (themeBtn) {
        const icon = themeBtn.querySelector('i');
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            icon.classList.remove('fa-moon', 'fa-regular');
            icon.classList.add('fa-sun', 'fa-solid');
        }
        
        themeBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('vibefeed_theme', newTheme);
            
            if (newTheme === 'dark') {
                icon.classList.remove('fa-moon', 'fa-regular');
                icon.classList.add('fa-sun', 'fa-solid');
            } else {
                icon.classList.remove('fa-sun', 'fa-solid');
                icon.classList.add('fa-moon', 'fa-regular');
            }
        });
    }
}

// -----------------------
// Data Management
// -----------------------
function loadPosts() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        posts = JSON.parse(stored);
    } else {
        posts = [...initialPosts];
        savePosts();
    }
}

function savePosts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

// -----------------------
// UI & Navigation
// -----------------------
function setupNavigation() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = item.getAttribute('data-target');
            
            // UX If clicking an already active tab, scroll to top
            if (item.classList.contains('active')) {
                const view = document.getElementById(targetId);
                const mainContent = document.getElementById('main-content');
                if (view && mainContent) {
                    mainContent.scrollTo({ top: 0, behavior: 'smooth' });
                }
                return;
            }
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Switch views
            views.forEach(view => {
                view.classList.remove('active');
                view.classList.add('hidden');
            });
            document.getElementById(targetId).classList.remove('hidden');
            document.getElementById(targetId).classList.add('active');

            // View specific rendering
            if (targetId === 'view-profile') {
                renderProfileFeed();
            } else if (targetId === 'view-feed') {
                renderFeed();
            }
            
            // Scroll to top
            document.getElementById('main-content').scrollTop = 0;
        });
    });
}

function setupFilters() {
    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            // Update UI state
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            
            // Update filter logic
            currentFilter = tag.getAttribute('data-tag');
            renderFeed();
        });
    });
}

// -----------------------
// Rendering Logic
// -----------------------
function renderFeed() {
    let filteredPosts = posts;
    if (currentFilter !== 'All') {
        filteredPosts = posts.filter(p => p.tag === currentFilter);
    }

    // Sort by newest first
    filteredPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (filteredPosts.length === 0) {
        feedContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
                <h3>No posts yet</h3>
                <p>Be the first to share something in this category!</p>
            </div>
        `;
    } else {
        feedContainer.innerHTML = filteredPosts.map(post => createPostHTML(post)).join('');
        attachLikeListeners(feedContainer);
    }
}

function renderProfileFeed() {
    // Only show posts from 'WIV Builder'
    const profilePosts = posts.filter(p => p.author === 'WIV Builder');
    profilePosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (profilePosts.length === 0) {
        profileFeedContainer.innerHTML = `
             <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                <i class="fa-solid fa-pen-to-square" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
                <h3>No contributions</h3>
                <p>Go to the write tab to create your first post.</p>
            </div>
        `;
    } else {
        profileFeedContainer.innerHTML = profilePosts.map(post => createPostHTML(post)).join('');
        attachLikeListeners(profileFeedContainer);
    }
    
    updateProfileStats();
}

function createPostHTML(post) {
    const imageHtml = post.image 
        ? `<img src="${post.image}" alt="Post image" class="post-image" onerror="this.style.display='none'">` 
        : '';
        
    const likeIconClass = post.isLiked ? 'fa-solid' : 'fa-regular';
    const likeBtnClass = post.isLiked ? 'action-btn like-btn liked' : 'action-btn like-btn';

    return `
        <article class="post-card" id="post-${post.id}">
            <div class="post-header">
                <img src="${post.authorAvatar}" alt="${post.author}" class="post-avatar">
                <div class="post-meta">
                    <div class="post-author">${post.author}</div>
                    <div class="post-time">${timeAgo(post.timestamp)}</div>
                </div>
                <div class="post-tag">${post.tag}</div>
            </div>
            ${imageHtml}
            <div class="post-content">
                ${post.title ? `<h3 class="post-title">${escapeHTML(post.title)}</h3>` : ''}
                ${escapeHTML(post.content)}
            </div>
            <div class="post-actions">
                <button class="${likeBtnClass}" data-id="${post.id}">
                    <i class="${likeIconClass} fa-heart"></i>
                    <span>${post.likes}</span>
                </button>
                <button class="action-btn comment-btn" data-id="${post.id}">
                    <i class="fa-regular fa-comment"></i>
                    <span>${post.comments || 0}</span>
                </button>
            </div>
        </article>
    `;
}

// -----------------------
// Helper Functions
// -----------------------
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
}

// Prevent XSS injections in user posts
function escapeHTML(str) {
    if(!str) return '';
    let div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
}

function updateProfileStats() {
    const myPosts = posts.filter(p => p.author === 'WIV Builder');
    profilePostsCount.textContent = myPosts.length;
    
    const totalLikes = myPosts.reduce((acc, post) => acc + post.likes, 0);
    profileLikesCount.textContent = totalLikes;
}

// -----------------------
// Interactions & Forms
// -----------------------
function attachLikeListeners(container) {
    const likeBtns = container.querySelectorAll('.like-btn');
    likeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const postId = parseInt(btn.getAttribute('data-id'));
            const postIndex = posts.findIndex(p => p.id === postId);
            
            if (postIndex > -1) {
                const post = posts[postIndex];
                
                // Toggle state
                post.isLiked = !post.isLiked;
                post.likes += post.isLiked ? 1 : -1;
                savePosts();
                
                // Visual update without full re-render for smoothness
                const icon = btn.querySelector('i');
                const span = btn.querySelector('span');
                
                if (post.isLiked) {
                    btn.classList.add('liked');
                    icon.classList.remove('fa-regular');
                    icon.classList.add('fa-solid');
                } else {
                    btn.classList.remove('liked');
                    icon.classList.remove('fa-solid');
                    icon.classList.add('fa-regular');
                }
                
                span.textContent = post.likes;
                
                // If we are in profile, liking updates our total likes stat slightly
                if (post.author === 'WIV Builder') {
                    updateProfileStats();
                }
            }
        });
    });
}

function setupForm() {
    const contentInput = document.getElementById('post-content');
    const charCountDisplay = document.getElementById('char-count');

    // Char count update
    if (contentInput && charCountDisplay) {
        contentInput.addEventListener('input', () => {
            const currentLength = contentInput.value.length;
            charCountDisplay.textContent = 300 - currentLength;
        });
    }

    // Live preview for image input
    postImageInput.addEventListener('input', (e) => {
        const url = e.target.value.trim();
        if (url) {
            imagePreviewContainer.classList.add('visible');
            imagePreviewContainer.innerHTML = `<img src="${url}" onerror="this.innerHTML='<i class=\\'fa-regular fa-image\\' style=\\'color:#FF6B6B;\\'></i><span style=\\'color:#FF6B6B;\\'>Failed to load image</span>'">`;
        } else {
            imagePreviewContainer.classList.remove('visible');
            imagePreviewContainer.innerHTML = `
                <i class="fa-regular fa-image"></i>
                <span>Preview will appear here</span>
            `;
        }
    });

    // Form Submission
    writeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = writeForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        // UX: Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Posting...';
        submitBtn.style.opacity = '0.8';
        submitBtn.style.cursor = 'not-allowed';
        
        setTimeout(() => {
            const titleInput = document.getElementById('post-title');
            const categoryInput = document.querySelector('input[name="category"]:checked');
            const imgUrl = postImageInput.value.trim();
            
            const newPost = {
                id: Date.now(),
                author: 'WIV Builder',
                authorAvatar: 'https://ui-avatars.com/api/?name=WIV+Builder&background=FF6B6B&color=fff&size=128',
                image: imgUrl,
                title: titleInput ? titleInput.value : '',
                content: contentInput.value,
                tag: categoryInput ? categoryInput.value : '#General',
                likes: 0,
                comments: 0,
                isLiked: false,
                timestamp: new Date().toISOString()
            };

            posts.push(newPost);
            savePosts();

            writeForm.reset();
            if(charCountDisplay) charCountDisplay.textContent = '300';
            imagePreviewContainer.classList.remove('visible');
            imagePreviewContainer.innerHTML = `<i class="fa-regular fa-image"></i><span>Preview will appear here</span>`;
            
            // UX Reset Button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
            
            const feedNavBtn = document.querySelector('.nav-item[data-target="view-feed"]');
            feedNavBtn.click();
            
            if (currentFilter !== 'All' && currentFilter !== newPost.tag) {
                 document.querySelector('.filter-tag[data-tag="All"]').click();
            }
        }, 400); // 400ms loading feedback UX
    });
}

// Boot up
// -----------------------
// Guestbook Logic
// -----------------------
const GB_STORAGE_KEY = 'vibefeed_memos';
let memos = [];

function loadMemos() {
    const stored = localStorage.getItem(GB_STORAGE_KEY);
    if (stored) {
        memos = JSON.parse(stored);
    } else {
        memos = [
            { id: 1, name: 'WIV Mentor', message: 'Keep up the great work everyone! So proud of the projects so far!', timestamp: new Date(Date.now() - 86400000).toISOString() }
        ];
        saveMemos();
    }
}

function saveMemos() {
    localStorage.setItem(GB_STORAGE_KEY, JSON.stringify(memos));
}

function renderMemos() {
    const gbList = document.getElementById('gb-list');
    if(!gbList) return;
    
    memos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (memos.length === 0) {
        gbList.innerHTML = `<p style="text-align:center; color: var(--text-muted); padding: 20px; font-weight: 500;">No memos yet. Be the first!</p>`;
        return;
    }
    
    gbList.innerHTML = memos.map(m => `
        <div class="memo-card" style="background: var(--card-bg); border-radius: var(--radius-sm); padding: 16px; box-shadow: var(--shadow-sm); border-left: 4px solid var(--primary-light); margin-bottom: 16px; transition: background-color 0.3s ease, border-color 0.3s ease;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">${escapeHTML(m.name)}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${timeAgo(m.timestamp)}</span>
            </div>
            <div style="color: var(--text-main); font-size: 0.95rem; line-height: 1.5; word-break: break-word;">
                ${escapeHTML(m.message)}
            </div>
        </div>
    `).join('');
}

function setupGuestbook() {
    const gbForm = document.getElementById('gb-form');
    if (gbForm) {
        gbForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = gbForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
            submitBtn.style.opacity = '0.8';
            submitBtn.style.cursor = 'not-allowed';
            
            setTimeout(() => {
                const gbNameInput = document.getElementById('gb-name');
                const gbMessageInput = document.getElementById('gb-message');
                
                const newMemo = {
                    id: Date.now(),
                    name: gbNameInput.value.trim(),
                    message: gbMessageInput.value.trim(),
                    timestamp: new Date().toISOString()
                };
                
                memos.unshift(newMemo);
                saveMemos();
                renderMemos();
                
                gbForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
            }, 300);
        });
    }
    
    const closeGbBtn = document.querySelector('.close-gb-btn');
    if (closeGbBtn) {
        closeGbBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.nav-item[data-target="view-feed"]').click();
        });
    }
}

document.addEventListener('DOMContentLoaded', init);
