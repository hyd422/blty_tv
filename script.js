// ====== 轮播图数据 ======
const carouselData = [
    {
        mainImg: 'https://picsum.photos/seed/carousel1/1200/500',
        thumbImg: 'https://picsum.photos/seed/thumb1/160/200',
        label: '双人舞',
        title: '柏里挑怡',
        subtitle: '#金曲唯一双冠王',
        author: '@柏欣妤&@朱怡欣'
    },
    {
        mainImg: 'https://picsum.photos/seed/carousel2/1200/500',
        thumbImg: 'https://picsum.photos/seed/thumb2/160/200',
        label: '金曲大赏',
        title: '柏里挑怡',
        subtitle: '#金曲大赏双连冠',
        author: '@柏欣妤&@朱怡欣'
    },
    {
        mainImg: 'https://picsum.photos/seed/carousel3/1200/500',
        thumbImg: 'https://picsum.photos/seed/thumb3/160/200',
        label: '巡演',
        title: '柏里挑怡',
        subtitle: '#双人巡演进行中',
        author: '@柏欣妤&@朱怡欣'
    }
];

// ====== 视频卡片数据 ======
const videoDataAll = [
    {
        title: '被你点亮的角落',
        tags: ['双人舞', '强制爱'],
        category: ['tour', 'all'],
        imgSeed: 'video1'
    },
    {
        title: '人生并不会完蛋',
        tags: ['粉红狙击手', '双A'],
        category: ['gold', 'all'],
        imgSeed: 'video2'
    },
    {
        title: '梦境出逃计划',
        tags: ['圈圈点点'],
        category: ['tour', 'all'],
        imgSeed: 'video3'
    },
    {
        title: '心跳花火 武汉',
        tags: ['变量', '暧昧'],
        category: ['tour', 'all'],
        imgSeed: 'video4'
    },
    {
        title: '金曲大赏',
        tags: ['First Love', '纯爱'],
        category: ['gold', 'all'],
        imgSeed: 'video5'
    },
    {
        title: '冕礼',
        tags: ['White Light'],
        category: ['birthday', 'all'],
        imgSeed: 'video6'
    },
    {
        title: '最佳拍档',
        tags: ['单向镜面'],
        category: ['tour', 'all'],
        imgSeed: 'video7'
    },
    {
        title: '金曲大赏 双冠',
        tags: ['夏之回忆'],
        category: ['gold', 'all'],
        imgSeed: 'video8'
    },
    {
        title: '第十一道轨迹',
        tags: ['Whistle', '双花'],
        category: ['gold', 'birthday', 'all'],
        imgSeed: 'video9'
    }
];

// ====== 当前轮播索引 ======
let currentSlideIndex = 0;
let autoPlayTimer = null;

// ====== 初始化页面 ======
document.addEventListener('DOMContentLoaded', function () {
    renderVideoGrid('all');
    initMenuClick();
    startAutoPlay();
});

// ====== 轮播图：上一张 ======
function prevSlide() {
    currentSlideIndex = (currentSlideIndex - 1 + carouselData.length) % carouselData.length;
    updateCarousel();
    resetAutoPlay();
}

// ====== 轮播图：下一张 ======
function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % carouselData.length;
    updateCarousel();
    resetAutoPlay();
}

// ====== 轮播图：跳转到指定 ======
function goToSlide(index) {
    currentSlideIndex = index;
    updateCarousel();
    resetAutoPlay();
}

// ====== 更新轮播图显示 ======
function updateCarousel() {
    const data = carouselData[currentSlideIndex];

    // 更新主图
    const mainImg = document.getElementById('carouselMainImg');
    mainImg.style.opacity = '0';
    setTimeout(() => {
        mainImg.src = data.mainImg;
        mainImg.style.opacity = '1';
    }, 150);
    mainImg.style.transition = 'opacity 0.3s ease';

    // 更新标题信息
    document.querySelector('.carousel-title').textContent = data.title;
    document.querySelector('.carousel-subtitle').textContent = data.subtitle;
    document.querySelector('.carousel-author').textContent = data.author;

    // 更新缩略图激活状态
    const thumbItems = document.querySelectorAll('.thumb-item');
    thumbItems.forEach((item, idx) => {
        if (idx === currentSlideIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// ====== 自动播放轮播图 ======
function startAutoPlay() {
    autoPlayTimer = setInterval(() => {
        nextSlide();
    }, 5000);
}

function resetAutoPlay() {
    if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
    }
    startAutoPlay();
}

// ====== 渲染视频网格 ======
function renderVideoGrid(category) {
    const grid = document.getElementById('videoGrid');
    const filteredData = videoDataAll.filter(v => v.category.includes(category));

    grid.innerHTML = '';
    grid.style.opacity = '0';

    setTimeout(() => {
        filteredData.forEach(video => {
            const card = createVideoCard(video);
            grid.appendChild(card);
        });
        grid.style.transition = 'opacity 0.3s ease';
        grid.style.opacity = '1';
    }, 100);
}

// ====== 创建单个视频卡片 ======
function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'video-card';

    const imgUrl = `https://picsum.photos/seed/${video.imgSeed}/600/380`;

    card.innerHTML = `
        <div class="video-thumb">
            <img src="${imgUrl}" alt="${video.title}" loading="lazy"
                 onerror="this.src='https://picsum.photos/seed/fallback_${video.imgSeed}/600/380'" />
            <div class="play-overlay"></div>
        </div>
        <div class="video-info">
            <h3 class="video-title">${video.title}</h3>
            <div class="video-tags">
                ${video.tags.map(tag => `<span class="video-tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        console.log('播放视频：', video.title);
        alert(`即将播放：${video.title}`);
    });

    return card;
}

// ====== 标签切换 ======
function switchTab(el, category) {
    // 移除所有激活状态
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.classList.remove('active');
    });
    // 激活当前
    el.classList.add('active');
    // 重新渲染
    renderVideoGrid(category);
}

// ====== 侧边栏菜单点击 ======
function initMenuClick() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            menuItems.forEach(m => m.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ====== 搜索框回车搜索 ======
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && this.value.trim()) {
                alert(`搜索：${this.value.trim()}`);
            }
        });
    }

    // 搜索标签点击
    const searchTags = document.querySelectorAll('.search-tags span');
    searchTags.forEach(tag => {
        tag.addEventListener('click', function () {
            if (searchInput) {
                searchInput.value = this.textContent;
                searchInput.focus();
            }
        });
    });

    // 用户头像点击
    const avatar = document.querySelector('.user-avatar img');
    if (avatar) {
        avatar.addEventListener('click', () => {
            console.log('打开个人中心');
        });
    }

    // 顶部图标点击
    const iconBtns = document.querySelectorAll('.nav-icons .icon-btn');
    iconBtns.forEach((btn, idx) => {
        const labels = ['下载内容', '消息中心', 'VIP会员中心'];
        btn.addEventListener('click', () => {
            console.log(labels[idx] || '点击了按钮');
        });
    });
});
