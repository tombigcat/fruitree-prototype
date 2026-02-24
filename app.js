// Fruitree v2.0 - Enhanced Interactive Prototype
const Storage = {
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(`fruitree_${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch {
            return defaultValue;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(`fruitree_${key}`, JSON.stringify(value));
        } catch {}
    },
    getUser() {
        return this.get('user', {
            id: 'user_001', name: '果树园丁',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gardener&backgroundColor=d1f4e0',
            dailyNutrients: 10, usedNutrients: 0,
            growingCount: 0, maxGrowing: 6, joinDays: 12,
            totalPosts: 0, totalMature: 0, totalGiven: 0
        });
    },
    saveUser(user) { this.set('user', user); },
    getPosts() {
        return this.get('posts', [
            {
                id: 'post_001',
                author: { name: '小森林', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=forest&backgroundColor=c0aede' },
                image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop',
                caption: '今天的云朵像棉花糖一样软 ☁️',
                nutrients: 42, targetNutrients: 50, hoursLeft: 18,
                createdAt: Date.now() - 7200000,
                isMature: false, hasLiked: false, likedBy: []
            },
            {
                id: 'post_002',
                author: { name: '光影捕手', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=light&backgroundColor=ffdfbf' },
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
                caption: '黄昏时分的山峦，每一秒颜色都在变化',
                nutrients: 8, targetNutrients: 50, hoursLeft: 3,
                createdAt: Date.now() - 75600000,
                isMature: false, hasLiked: true, likedBy: ['user_001']
            },
            {
                id: 'post_003',
                author: { name: '城市漫步者', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=city&backgroundColor=b6e3f4' },
                image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop',
                caption: '老巷子里发现的一家咖啡馆，时光仿佛静止了',
                nutrients: 51, targetNutrients: 50, hoursLeft: null,
                createdAt: Date.now() - 259200000,
                isMature: true, hasLiked: false, likedBy: ['user_001','user_002','user_003'],
                maturedAt: Date.now() - 172800000
            },
            {
                id: 'post_004',
                author: { name: '植物收藏家', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=plant&backgroundColor=ffd5dc' },
                image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=400&fit=crop',
                caption: '新入手的龟背竹，希望能茁壮成长 🌿',
                nutrients: 15, targetNutrients: 50, hoursLeft: 12,
                createdAt: Date.now() - 43200000,
                isMature: false, hasLiked: false, likedBy: []
            },
            {
                id: 'post_005',
                author: { name: '海边日记', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sea&backgroundColor=ffdfbf' },
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
                caption: '海的声音',
                nutrients: 5, targetNutrients: 50, hoursLeft: 1,
                createdAt: Date.now() - 82800000,
                isMature: false, hasLiked: false, likedBy: []
            }
        ]);
    },
    savePosts(posts) { this.set('posts', posts); },
    reset() {
        localStorage.removeItem('fruitree_user');
        localStorage.removeItem('fruitree_posts');
    }
};

let currentUser = Storage.getUser();
let posts = Storage.getPosts();
let currentView = 'home';
let selectedPost = null;

function updateUserStats() {
    const myPosts = posts.filter(p => p.author.name === currentUser.name);
    currentUser.growingCount = myPosts.filter(p => !p.isMature).length;
    currentUser.totalPosts = myPosts.length;
    currentUser.totalMature = myPosts.filter(p => p.isMature).length;
    Storage.saveUser(currentUser);
}

function formatTime(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return new Date(timestamp).toLocaleDateString('zh-CN');
}

function render() {
    const app = document.getElementById('app');
    updateUserStats();
    let content = '';
    switch(currentView) {
        case 'home': content = renderHome(); break;
        case 'icu': content = renderICU(); break;
        case 'discover': content = renderDiscover(); break;
        case 'profile': content = renderProfile(); break;
        case 'post': content = renderPost(); break;
        case 'detail': content = renderDetail(); break;
    }
    app.innerHTML = content;
    attachEventListeners();
}

function renderHeader(view) {
    const titles = {
        home: '<div class="flex items-center gap-2"><i class="fas fa-tree text-emerald-500 text-xl"></i><span class="font-bold text-lg gradient-text">Fruitree</span></div>',
        icu: '<h1 class="font-bold text-lg text-red-600"><i class="fas fa-heart-pulse mr-2"></i>急救室</h1>',
        discover: '<h1 class="font-bold text-lg"><i class="fas fa-compass mr-2 text-emerald-500"></i>发现</h1>',
        profile: '<h1 class="font-bold text-lg">我的果树</h1>',
        post: '<h1 class="font-bold text-lg">发布作品</h1>',
        detail: ''
    };
    if (view === 'detail') return '';
    return `<div class="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-100"><div class="max-w-md mx-auto h-14 flex items-center justify-between px-4">${titles[view] || '<h1 class="font-bold text-lg">Fruitree</h1>'}<div class="w-8"></div></div></div>`;
}

function renderTabBar(activeTab) {
    const tabs = [
        { id: 'home', icon: 'fa-house', label: '首页' },
        { id: 'icu', icon: 'fa-heart-pulse', label: '急救' },
        { id: 'discover', icon: 'fa-compass', label: '发现' },
        { id: 'profile', icon: 'fa-user', label: '我的' }
    ];
    return `<div class="tab-bar"><div class="max-w-md mx-auto flex justify-around py-2">${tabs.map(tab => `<button class="flex flex-col items-center py-1 px-4 transition btn-press ${activeTab === tab.id ? 'text-emerald-500' : 'text-gray-400'}" onclick="navigate('${tab.id}')"><i class="fas ${tab.icon} text-xl mb-1 ${activeTab === tab.id ? 'pulse-heart' : ''}"></i><span class="text-xs">${tab.label}</span></button>`).join('')}</div></div>`;
}

function renderFloatingButton() {
    return `<button class="fab" onclick="navigate('post')"><i class="fas fa-plus"></i></button>`;
}

function renderMiniProgress(current, target) {
    const percentage = Math.min(100, (current / target) * 100);
    const circumference = 2 * Math.PI * 14;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    return `<svg width="32" height="32" viewBox="0 0 32 32" class="circular-progress"><circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="3"/><circle cx="16" cy="16" r="14" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}"/></svg>`;
}

function renderPostCard(post) {
    const progress = Math.min(100, (post.nutrients / post.targetNutrients) * 100);
    return `<div class="post-card bg-white rounded-2xl overflow-hidden card-shadow cursor-pointer" onclick="showDetail('${post.id}')"><div class="flex items-center gap-3 p-3"><img src="${post.author.avatar}" class="w-8 h-8 rounded-full"><span class="font-medium text-sm">${post.author.name}</span><span class="text-xs text-gray-400 ml-auto">${formatTime(post.createdAt)}</span></div><div class="relative"><img src="${post.image}" class="w-full aspect-square object-cover"></div><div class="p-3"><p class="text-sm text-gray-800 mb-3 line-clamp-2">${post.caption}</p><div class="flex items-center gap-3"><div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500" style="width: ${progress}%"></div></div><span class="text-xs text-emerald-600 font-medium">${post.nutrients}/${post.targetNutrients}</span></div></div></div>`;
}

function renderICUCard(post, index) {
    const progress = Math.min(100, (post.nutrients / post.targetNutrients) * 100);
    return `<div class="bg-white rounded-2xl overflow-hidden card-shadow border-2 border-red-200 danger-pulse cursor-pointer" onclick="showDetail('${post.id}')" style="animation: pageSlide 0.4s ease-out ${index * 0.1}s both"><div class="flex"><img src="${post.image}" class="w-28 h-28 object-cover"><div class="flex-1 p-3 flex flex-col justify-between"><div><div class="flex items-center gap-2 mb-1"><img src="${post.author.avatar}" class="w-5 h-5 rounded-full"><span class="text-xs font-medium">${post.author.name}</span></div><p class="text-xs text-gray-600 line-clamp-2">${post.caption}</p></div><div><div class="flex items-center justify-between mb-1"><span class="text-xs text-red-500 font-medium pulse-heart">⏰ ${post.hoursLeft}小时后死亡</span><span class="text-xs text-gray-500">还差${post.targetNutrients - post.nutrients}养料</span></div><div class="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-500" style="width: ${progress}%"></div></div></div></div></div></div>`;
}

function renderHome() {
    const activePosts = posts.filter(p => !p.isMature && p.hoursLeft > 6).sort((a, b) => b.createdAt - a.createdAt);
    const remainingNutrients = currentUser.dailyNutrients - currentUser.usedNutrients;
    return `${renderHeader('home')}<div class="pt-20 pb-24 px-4 page-transition"><div class="bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-3xl p-5 mb-5 text-white card-shadow relative overflow-hidden"><div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div><div class="absolute -bottom-8 -left-8 w-24 h-24 bg-white/5 rounded-full"></div><div class="relative z-10"><div class="flex justify-between items-start mb-4"><div><p class="text-emerald-100 text-sm mb-1">今日剩余养料</p><div class="flex items-baseline gap-1"><span class="text-4xl font-bold">${remainingNutrients}</span><span class="text-emerald-100">/ ${currentUser.dailyNutrients}</span></div></div><div class="text-right"><p class="text-emerald-100 text-sm mb-1">培育中</p><div class="flex items-baseline gap-1"><span class="text-3xl font-bold">${currentUser.growingCount}</span><span class="text-emerald-100">/ ${currentUser.maxGrowing}</span></div></div></div><div class="flex gap-2 flex-wrap">${Array(currentUser.dailyNutrients).fill(0).map((_, i) => `<div class="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${i < currentUser.usedNutrients ? 'bg-white/20' : 'bg-white float'}" style="animation-delay: ${i * 0.1}s">${i >= currentUser.usedNutrients ? '<i class="fas fa-heart text-emerald-500 text-xs"></i>' : ''}</div>`).join('')}</div></div></div><div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center"><i class="fas fa-seedling text-emerald-500"></i></div><h2 class="text-lg font-bold text-gray-800">培育中</h2></div><span class="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">${activePosts.length} 个作品</span></div><div class="space-y-4">${activePosts.length > 0 ? activePosts.map(post => renderPostCard(post)).join('') : `<div class="text-center py-12 text-gray-400"><div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center sway"><i class="fas fa-seedling text-3xl text-gray-300"></i></div><p class="text-gray-500">暂时没有培育中的作品</p><p class="text-sm mt-1">去急救室看看需要帮助的果树吧！</p></div>`}</div></div>${renderTabBar('home')}${renderFloatingButton()}`;
}

function renderICU() {
    const dyingPosts = posts.filter(p => !p.isMature && p.hoursLeft <= 6).sort((a, b) => a.hoursLeft - b.hoursLeft);
    return `${renderHeader('icu')}<div class="pt-20 pb-24 px-4 page-transition"><div class="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4 mb-5 danger-pulse"><div class="flex items-center gap-3"><div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center pulse-heart"><i class="fas fa-heart-pulse text-red-500 text-xl"></i></div><div class="flex-1"><h3 class="font-bold text-red-700">急救室</h3><p class="text-sm text-red-600">这些作品生命即将结束，急需你的养料！</p></div></div></div><div class="space-y-4">${dyingPosts.length > 0 ? dyingPosts.map((post, index) => renderICUCard(post, index)).join('') : `<div class="text-center py-16"><div class="w-24 h-24 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center"><i class="fas fa-heart-circle-check text-4xl text-emerald-500"></i></div><p class="text-gray-600 font-medium">太棒了！</p><p class="text-sm text-gray-400 mt-1">暂时没有濒危作品，所有果树都很健康 💚</p></div>`}</div></div>${renderTabBar('icu')}${renderFloatingButton()}`;
}

function renderDiscover() {
    const maturePosts = posts.filter(p => p.isMature).sort((a, b) => (b.maturedAt || 0) - (a.maturedAt || 0));
    return `${renderHeader('discover')}<div class="pt-20 pb-24 px-4 page-transition"><div class="flex items-center gap-2 mb-5"><div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center"><i class="fas fa-trophy text-amber-500"></i></div><h2 class="text-lg font-bold text-gray-800">成熟珍藏</h2></div><div class="grid grid-cols-2 gap-3">${maturePosts.map((post, index) => `<div class="post-card bg-white rounded-2xl overflow-hidden card-shadow cursor-pointer" onclick="showDetail('${post.id}')" style="animation: pageSlide 0.4s ease-out ${index * 0.1}s both"><div class="relative"><img src="${post.image}" class="w-full aspect-square object-cover"><div class="absolute inset-0 bg-gradient-to-t from-emerald-600/80 via-transparent to-transparent"></div><div class="absolute bottom-0 left-0 right-0 p-3"><div class="flex items-center gap-2"><img src="${post.author.avatar}" class="w-6 h-6 rounded-full border border-white/50"><span class="text-white text-xs font-medium truncate">${post.author.name}</span></div></div><div class="absolute top-2 right-2"><span class="badge bg-emerald-500/90 text-white text-xs"><i class="fas fa-award mr-1"></i>成熟</span></div></div><div class="p-3"><p class="text-xs text-gray-600 line-clamp-2">${post.caption}</p><div class="flex items-center gap-1 mt-2 text-amber-500"><i class="fas fa-heart text-xs"></i><span class="text-xs font-medium">${post.nutrients} 养料</span></div></div></div>`).join('')}</div>${maturePosts.length === 0 ? `<div class="text-center py-16 text-gray-400"><div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center"><i class="fas fa-award text-3xl text-gray-300"></i></div><p>还没有成熟的作品</p><p class="text-sm mt-1">快去培育你的第一颗果实吧！</p></div>` : ''}</div>${renderTabBar('discover')}${renderFloatingButton()}`;
}

function renderProfile() {
    const myGrowing = posts.filter(p => p.author.name === currentUser.name && !p.isMature);
    const myMature = posts.filter(p => p.author.name === currentUser.name && p.isMature);
    return `${renderHeader('profile')}<div class="pt-16 pb-24 page-transition"><div class="bg-gradient-to-b from-emerald-50 via-emerald-50/50 to-white px-4 pb-6"><div class="flex items-center gap-4 pt-4"><div class="relative"><img src="${currentUser.avatar}" class="w-20 h-20 rounded-full border-4 border-white card-shadow"><div class="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white"><i class="fas fa-check text-white text-xs"></i></div></div><div class="flex-1"><h2 class="text-xl font-bold text-gray-800">${currentUser.name}</h2><p class="text-gray-500 text-sm">果树园丁 · 加入第 ${currentUser.joinDays} 天</p><div class="flex gap-2 mt-2"><span class="badge bg-emerald-100 text-emerald-600 text-xs"><i class="fas fa-leaf mr-1"></i>Lv.${Math.floor(currentUser.totalMature / 3) + 1}</span></div></div></div><div class="flex justify-around mt-6 py-4 bg-white rounded-2xl card-shadow"><div class="text-center px-4 border-r border-gray-100"><p class="text-2xl font-bold text-emerald-600">${currentUser.totalPosts}</p><p class="text-xs text-gray-500">发布作品</p></div><div class="text-center px-4 border-r border-gray-100"><p class="text-2xl font-bold text-emerald-600">${currentUser.totalMature}</p><p class="text-xs text-gray-500">已成熟</p></div><div class="text-center px-4"><p class="text-2xl font-bold text-emerald-600">${currentUser.totalGiven}</p><p class="text-xs text-gray-500">送出养料</p></div></div></div><div class="px-4"><div class="mb-6"><div class="flex items-center justify-between mb-3"><h3 class="font-bold text-gray-800 flex items-center gap-2"><i class="fas fa-seedling text-emerald-500"></i>培育中 (${myGrowing.length}/${currentUser.maxGrowing})</h3>${myGrowing.length >= currentUser.maxGrowing ? '<span class="text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded-full">已达上限</span>' : ''}</div><div class="grid grid-cols-3 gap-3">${myGrowing.slice(0, 6).map(post => `<div class="aspect-square rounded-2xl overflow-hidden relative card-shadow cursor-pointer btn-press" onclick="showDetail('${post.id}')"><img src="${post.image}" class="w-full h-full object-cover"><div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2"><div class="flex items-center gap-1"><i class="fas fa-heart text-white text-xs"></i><span class="text-white text-xs font-medium">${post.nutrients}</span></div></div>${post.hoursLeft <= 6 ? '<div class="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full animate-ping"></div><div class="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full"></div>' : ''}<div class="absolute top-2 left-2">${renderMiniProgress(post.nutrients, post.targetNutrients)}</div></div>`).join('')}${Array(Math.max(0, 6 - myGrowing.length)).fill(0).map(() => `<div class="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:border-emerald-300 hover:text-emerald-400 transition cursor-pointer" onclick="navigate('post')"><i class="fas fa-plus text-2xl mb-1"></i><span class="text-xs">添加</span></div>`).join('')}</div></div><div><h3 class="font-bold text-gray-800 mb-3 flex items-center gap-2"><i class="fas fa-award text-amber-500"></i>我的珍藏 (${myMature.length})</h3><div class="grid grid-cols-3 gap-3">${myMature.map(post => `<div class="aspect-square rounded-2xl overflow-hidden relative card-shadow cursor-pointer btn-press" onclick="showDetail('${post.id}')"><img src="${post.image}" class="w-full h-full object-cover"><div class="absolute inset-0 bg-gradient-to-t from-emerald-600/90 via-emerald-600/20 to-transparent flex flex-col items-center justify-end pb-3"><i class="fas fa-award text-white/90 text-lg mb-1"></i><span class="text-white text-xs font-medium">已成熟</span></div></div>`).join('')}</div>${myMature.length === 0 ? '<div class="text-center py-8 text-gray-400 bg-gray-50 rounded-2xl"><i class="fas fa-box-open text-3xl mb-2"></i><p class="text-sm">还没有成熟的珍藏</p></div>' : ''}</div><div class="mt-8"><button onclick="resetData()" class="w-full py-3 text-red-500 text-sm hover:bg-red-50 rounded-xl transition"><i class="fas fa-trash-alt mr-2"></i>重置数据</button></div></div></div>${renderTabBar('profile')}${renderFloatingButton()}`;
}

function renderPost() {
    const canPost = currentUser.growingCount < currentUser.maxGrowing;
    return `${renderHeader('post')}<div class="pt-20 pb-24 px-4 page-transition">${!canPost ? '<div class="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4 animate-pulse"><div class="flex items-center gap-2 mb-1"><i class="fas fa-exclamation-triangle text-orange-500"></i><span class="text-orange-700 font-medium">培育位已满</span></div><p class="text-sm text-orange-600">你有6个作品正在培育中，请等待作品成熟后再发布。</p></div>' : ''}<div class="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center mb-4 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition group" id="uploadArea"><div class="w-20 h-20 rounded-full bg-gray-200 group-hover:bg-emerald-200 flex items-center justify-center mb-3 transition"><i class="fas fa-camera text-3xl text-gray-400 group-hover:text-emerald-500 transition"></i></div><p class="text-gray-500 group-hover:text-emerald-600 transition">点击上传图片</p><p class="text-xs text-gray-400 mt-1">支持 JPG, PNG, WebP</p></div><div class="mb-4"><label class="block text-sm font-medium text-gray-700 mb-2"><i class="fas fa-pen mr-1 text-emerald-500"></i>描述</label><textarea id="postCaption" class="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-gray-50" rows="4" placeholder="分享这张图片的故事..." maxlength="140" oninput="updateCharCount(this)"></textarea><p class="text-xs text-gray-400 mt-1 text-right" id="charCount">0/140</p></div><div class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-6 border border-emerald-100"><div class="flex items-start gap-3"><div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0"><i class="fas fa-info text-emerald-500 text-sm"></i></div><div class="text-sm"><p class="font-medium text-emerald-800 mb-1">发布后将获得：</p><ul class="space-y-1 text-emerald-600"><li class="flex items-center gap-2"><i class="fas fa-check text-xs"></i> 24小时免费保护期</li><li class="flex items-center gap-2"><i class="fas fa-check text-xs"></i> 每天需1个养料续命</li><li class="flex items-center gap-2"><i class="fas fa-check text-xs"></i> 50养料即可永久珍藏</li></ul></div></div></div><div class="space-y-3"><button class="w-full py-4 rounded-xl font-bold text-white transition ripple btn-press ${canPost ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 card-shadow' : 'bg-gray-300 cursor-not-allowed'}" ${!canPost ? 'disabled' : ''} onclick="submitPost()"><i class="fas fa-paper-plane mr-2"></i>发布作品</button><button class="w-full py-3 text-gray-500 hover:bg-gray-100 rounded-xl transition btn-press" onclick="navigate('home')">取消</button></div></div>`;
}

function renderDetail() {
    if (!selectedPost) return navigate('home');
    const progress = Math.min(100, (selectedPost.nutrients / selectedPost.targetNutrients) * 100);
    const isDying = selectedPost.hoursLeft !== null && selectedPost.hoursLeft <= 6;
    const canNutrient = !selectedPost.hasLiked && !selectedPost.isMature && (currentUser.dailyNutrients - currentUser.usedNutrients) > 0;
    const remainingNutrients = currentUser.dailyNutrients - currentUser.usedNutrients;
    const treeHeight = Math.max(20, progress * 0.8);
    const hasLeaves = progress > 30;
    const hasFruits = progress > 70;
    return `${renderHeader('detail')}<div class="pb-24 page-transition-back"><div class="relative"><img src="${selectedPost.image}" class="w-full aspect-square object-cover"><button onclick="navigateBack()" class="absolute top-4 left-4 w-10 h-10 bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white btn-press hover:bg-black/50 transition"><i class="fas fa-arrow-left"></i></button>${selectedPost.isMature ? '<div class="absolute top-4 right-4"><span class="badge bg-emerald-500 text-white"><i class="fas fa-award mr-1"></i>已成熟</span></div>' : ''}</div><div class="px-4 py-5"><div class="flex items-center gap-3 mb-4"><img src="${selectedPost.author.avatar}" class="w-12 h-12 rounded-full card-shadow"><div class="flex-1"><p class="font-bold text-gray-800">${selectedPost.author.name}</p><p class="text-xs text-gray-500">${formatTime(selectedPost.createdAt)}</p></div>${selectedPost.author.name !== currentUser.name ? '<button class="px-4 py-2 bg-emerald-100 text-emerald-600 rounded-full text-sm font-medium hover:bg-emerald-200 transition btn-press"><i class="fas fa-plus mr-1"></i>关注</button>' : ''}</div><p class="text-gray-800 text-lg leading-relaxed mb-6">${selectedPost.caption}</p><div class="bg-white rounded-2xl p-5 mb-5 card-shadow border border-gray-100">${selectedPost.isMature ? '<div class="text-center py-4"><div class="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 tree-grow"><i class="fas fa-award text-3xl text-emerald-500"></i></div><p class="font-bold text-emerald-600 text-lg mb-1">恭喜成熟！</p><p class="text-sm text-gray-500">获得 ' + selectedPost.nutrients + ' 个养料，永久珍藏</p><div class="flex justify-center gap-1 mt-3">' + Array(5).fill(0).map(() => '<i class="fas fa-star text-amber-400 text-sm float"></i>').join('') + '</div></div>' : `<div><div class="flex items-center justify-between mb-3"><span class="font-medium text-gray-700">成长进度</span><span class="text-emerald-600 font-bold">${selectedPost.nutrients}/${selectedPost.targetNutrients}</span></div><div class="relative h-20 bg-gradient-to-b from-sky-50 to-emerald-50 rounded-xl overflow-hidden mb-4"><div class="absolute bottom-0 left-0 right-0 h-5 bg-gradient-to-b from-amber-600 to-amber-700"></div><div class="absolute bottom-4 left-0 right-0 flex justify-center gap-8"><div class="w-3 h-3 bg-emerald-400 rounded-full"></div><div class="w-2 h-2 bg-emerald-300 rounded-full"></div><div class="w-3 h-3 bg-emerald-400 rounded-full"></div></div><div class="absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-700">${hasFruits ? '<div class="absolute -top-2 left-1/2 -translate-x-1/2"><div class="w-3 h-3 bg-red-400 rounded-full float" style="animation-delay:0s"></div></div><div class="absolute top-2 -left-3"><div class="w-2.5 h-2.5 bg-amber-400 rounded-full float" style="animation-delay:0.3s"></div></div><div class="absolute top-1 -right-3"><div class="w-2.5 h-2.5 bg-orange-400 rounded-full float" style="animation-delay:0.6s"></div></div>' : ''}${hasLeaves ? '<div class="absolute -top-4 left-1/2 -translate-x-1/2"><div class="w-12 h-10 bg-gradient-to-b from-emerald-400 to-emerald-500 rounded-full sway" style="transform-origin:bottom center"></div><div class="absolute top-2 -left-2 w-8 h-8 bg-gradient-to-b from-emerald-300 to-emerald-400 rounded-full sway" style="transform-origin:bottom center;animation-delay:0.2s"></div><div class="absolute top-2 -right-2 w-8 h-8 bg-gradient-to-b from-emerald-300 to-emerald-400 rounded-full sway" style="transform-origin:bottom center;animation-delay:0.4s"></div></div>' : ''}<div class="w-2 bg-gradient-to-t from-amber-800 via-amber-700 to-amber-600 rounded-full mx-auto transition-all duration-700" style="height:${treeHeight}px;transform-origin:bottom"></div></div></div><div class="flex items-center justify-between"><div class="flex items-center gap-2"><i class="fas fa-clock ${isDying ? 'text-red-500 pulse-heart' : 'text-gray-400'}"></i><span class="text-sm ${isDying ? 'text-red-500 font-medium' : 'text-gray-500'}">${isDying ? '⚠️ 剩余 ' : ''}${selectedPost.hoursLeft} 小时</span></div>${isDying ? '<span class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">濒危</span>' : ''}</div></div>`}</div><div class="flex items-center justify-around py-4 bg-gray-50 rounded-xl mb-5"><div class="text-center"><i class="fas fa-heart text-red-400 text-xl mb-1"></i><p class="text-sm font-medium">${selectedPost.nutrients} 养料</p></div><div class="w-px h-8 bg-gray-200"></div><div class="text-center"><i class="fas fa-eye text-blue-400 text-xl mb-1"></i><p class="text-sm font-medium">${Math.floor(Math.random()*500)+100} 浏览</p></div><div class="w-px h-8 bg-gray-200"></div><div class="text-center"><i class="fas fa-share-nodes text-green-400 text-xl mb-1"></i><p class="text-sm font-medium">分享</p></div></div>${!selectedPost.isMature ? `<button id="nutrientBtn" class="w-full py-4 rounded-xl font-bold text-white transition ripple btn-press ${canNutrient ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 card-shadow' : 'bg-gray-300'}" ${!canNutrient ? 'disabled' : ''} onclick="giveNutrient(event)">${selectedPost.hasLiked ? '<i class="fas fa-check mr-2"></i>已赠送养料' : canNutrient ? `<i class="fas fa-heart mr-2 pulse-heart"></i>赠送养料 (剩余 ${remainingNutrients})` : '<i class="fas fa-times-circle mr-2"></i>今日养料已用完'}</button>` : '<button class="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-amber-100 to-orange-100 text-amber-600"><i class="fas fa-award mr-2"></i>成熟作品，无需养料</button>'}</div></div></div>`;
}

function navigate(view) {
    previousView = currentView;
    currentView = view;
    selectedPost = null;
    render();
}

function navigateBack() {
    currentView = previousView || 'home';
    selectedPost = null;
    render();
}

function showDetail(postId) {
    selectedPost = posts.find(p => p.id === postId);
    if (selectedPost) {
        previousView = currentView;
        currentView = 'detail';
        render();
    }
}

function giveNutrient(event) {
    if (!selectedPost || selectedPost.hasLiked || selectedPost.isMature) return;
    if (currentUser.usedNutrients >= currentUser.dailyNutrients) return;
    
    selectedPost.nutrients++;
    selectedPost.hasLiked = true;
    selectedPost.likedBy.push(currentUser.id);
    currentUser.usedNutrients++;
    currentUser.totalGiven++;
    
    if (selectedPost.nutrients >= selectedPost.targetNutrients) {
        selectedPost.isMature = true;
        selectedPost.hoursLeft = null;
        selectedPost.maturedAt = Date.now();
    }
    
    Storage.saveUser(currentUser);
    Storage.savePosts(posts);
    
    createParticles(event);
    render();
}

function createParticles(event) {
    const btn = event.currentTarget;
    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'nutrient-particle';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.setProperty('--tx', (Math.random() - 0.5) * 200 + 'px');
        particle.style.setProperty('--ty', (Math.random() - 1) * 200 + 'px');
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }
}

function updateCharCount(textarea) {
    const count = textarea.value.length;
    document.getElementById('charCount').textContent = count + '/140';
}

function submitPost() {
    const caption = document.getElementById('postCaption').value.trim();
    if (!caption) {
        alert('请填写描述');
        return;
    }
    
    const newPost = {
        id: 'post_' + Date.now(),
        author: { name: currentUser.name, avatar: currentUser.avatar },
        image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop',
        caption: caption,
        nutrients: 0,
        targetNutrients: 50,
        hoursLeft: 24,
        createdAt: Date.now(),
        isMature: false,
        hasLiked: false,
        likedBy: []
    };
    
    posts.unshift(newPost);
    Storage.savePosts(posts);
    navigate('home');
}

function resetData() {
    if (confirm('确定要重置所有数据吗？')) {
        Storage.reset();
        currentUser = Storage.getUser();
        posts = Storage.getPosts();
        render();
    }
}

function attachEventListeners() {
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
        uploadArea.addEventListener('click', () => {
            alert('图片上传功能在原型中暂未实现');
        });
    }
}

document.addEventListener('DOMContentLoaded', render);
