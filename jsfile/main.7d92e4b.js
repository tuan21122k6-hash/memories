 <script type="module">
      import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
      import {
        getFirestore,
        collection,
        addDoc,
        onSnapshot,
        query,
        orderBy,
      } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
      import {
        getStorage,
        ref,
        uploadBytes,
        getDownloadURL,
      } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

      // Cấu hình kết nối từ Firebase của bạn (`memories-97628`)
      const firebaseConfig = {
        apiKey: "AIzaSyCl3oYqiiDdYGS-ZWES4SKI20zd9RpdN-Y",
        authDomain: "memories-97628.firebaseapp.com",
        projectId: "memories-97628",
        storageBucket: "memories-97628.firebasestorage.app",
        messagingSenderId: "1054642141362",
        appId: "1:1054642141362:web:1c48661da5cbfb57bcb1ab",
        measurementId: "G-6MLKYM33NK",
      };

      // Khởi tạo Firebase
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      const storage = getStorage(app);

      // Gắn vào window để các hàm toàn cục gọi được
      window.db = db;
      window.storage = storage;
      window.collection = collection;
      window.addDoc = addDoc;
      window.onSnapshot = onSnapshot;
      window.query = query;
      window.orderBy = orderBy;
      window.ref = ref;
      window.uploadBytes = uploadBytes;
      window.getDownloadURL = getDownloadURL;

      // Khởi chạy đồng bộ dữ liệu sau khi đăng nhập thành công
      window.initFirebaseSync = function () {
        initGuestbookSync();
        initPhotosSync();
      };
    </script>

    <script>
      // 1. STRICT VALID BIRTH DATES REGISTRY
      const validBirthDates = {
        "25/07/2006": "Nguyễn Hương Giang",
        "16/04/2006": "Đỗ Hữu Tuân",
        "24/10/2006": "Chu Thị Lan Anh",
        "09/04/2006": "Nguyễn Văn Đạt",
        "20/12/2006": "Nguyễn Tuấn Anh",
        "20/10/2006": "Phan Lạc Quốc Anh",
      };

      function handleLogin() {
        const inputField = document.getElementById("birthdate-input");
        const enteredDate = inputField.value.trim();

        if (!enteredDate) {
          showToast("Vui lòng nhập ngày tháng năm sinh!");
          return;
        }

        if (validBirthDates.hasOwnProperty(enteredDate)) {
          const memberName = validBirthDates[enteredDate];
          document.getElementById("welcome-badge").textContent =
            `Chào ${memberName} ✨`;
          showToast(`Xác thực thành công! Chào mừng ${memberName} 🌿`);

          const lockScreen = document.getElementById("lock-screen");
          const mainWebsite = document.getElementById("main-website");

          gsap.to(lockScreen, {
            opacity: 0,
            duration: 0.6,
            onComplete: () => {
              lockScreen.style.display = "none";
              mainWebsite.classList.remove("pointer-events-none");
              gsap.to(mainWebsite, { opacity: 1, duration: 0.8 });

              // Kích hoạt đồng bộ Realtime từ Firebase
              if (window.initFirebaseSync) {
                window.initFirebaseSync();
              }
            },
          });
        } else {
          showToast("Ngày sinh không chính xác! Không thể truy cập.");
          gsap.fromTo(
            "#birthdate-input",
            { x: -12 },
            { x: 12, duration: 0.1, yoyo: true, repeat: 4 },
          );
        }
      }

      function showToast(msg) {
        const toast = document.getElementById("toast");
        toast.textContent = msg;
        gsap.to(toast, { opacity: 1, y: 10, duration: 0.3 });
        setTimeout(() => {
          gsap.to(toast, { opacity: 0, y: 0, duration: 0.3 });
        }, 2600);
      }

      // 4. EVENTS & ALBUM DATASET (Base + Firestore Sync)
      const samplePhotosPool = [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=80",
      ];

      const baseEventsData = [
        {
          id: 1,
          title: "Hành Trình Săn Mây Đà Lạt",
          date: "Tháng 10/2025",
          cover: samplePhotosPool[0],
          description:
            "Chuyến đi 3 ngày 2 đêm đầy ắp tiếng cười, sương lạnh buổi sớm và những nồi lẩu nóng hổi.",
          photos: samplePhotosPool.slice(0, 10),
        },
        {
          id: 2,
          title: "Sinh Nhật Rực Rỡ Tuổi 20",
          date: "Tháng 12/2025",
          cover: samplePhotosPool[3],
          description:
            "Đêm tiệc bất ngờ với bánh kem, nến và các sub-album riêng theo từng thành viên.",
          isBirthdayEvent: true,
          photos: samplePhotosPool.slice(2, 12),
        },
        {
          id: 3,
          title: "Mùa Tổng Kết & Kỷ Yếu 12",
          date: "Tháng 05/2026",
          cover: samplePhotosPool[1],
          description:
            "Khép lại những năm tháng áo trắng cắp sách đến trường bằng bộ ảnh kỷ niệm thanh xuân.",
          photos: samplePhotosPool.slice(1, 11),
        },
        {
          id: 4,
          title: "Cắm Trại Đêm Hồ Suối Hai",
          date: "Tháng 07/2026",
          cover: samplePhotosPool[4],
          description:
            "Đốt lửa trại, nướng khoai, đàn hát vu vơ và ngắm trọn vẹn bầu trời đầy sao.",
          photos: samplePhotosPool.slice(4, 12),
        },
      ];

      const baseMemberPhotosData = {
        "Nguyễn Hương Giang": [
          {
            url: samplePhotosPool[0],
            year: "2026",
            topic: "Du lịch",
            caption: "Sapa mùa săn mây",
          },
          {
            url: samplePhotosPool[1],
            year: "2026",
            topic: "Chân dung",
            caption: "Ảnh kỷ yếu cận cảnh",
          },
        ],
        "Đỗ Hữu Tuân": [
          {
            url: samplePhotosPool[2],
            year: "2025",
            topic: "Du lịch",
            caption: "Đà Lạt trip",
          },
          {
            url: samplePhotosPool[3],
            year: "2025",
            topic: "Chân dung",
            caption: "Chân dung nghiêm túc",
          },
        ],
        "Chu Thị Lan Anh": [
          {
            url: samplePhotosPool[4],
            year: "2026",
            topic: "Du lịch",
            caption: "Cắm trại cùng nhóm",
          },
          {
            url: samplePhotosPool[5],
            year: "2025",
            topic: "Chân dung",
            caption: "Chụp ảnh nghệ thuật",
          },
        ],
        "Nguyễn Văn Đạt": [
          {
            url: samplePhotosPool[6],
            year: "2026",
            topic: "Du lịch",
            caption: "Khám phá đó đây",
          },
          {
            url: samplePhotosPool[7],
            year: "2026",
            topic: "Chân dung",
            caption: "Khoảnh khắc cool ngầu",
          },
        ],
        "Nguyễn Tuấn Anh": [
          {
            url: samplePhotosPool[8],
            year: "2026",
            topic: "Chân dung",
            caption: "Năng động trẻ trung",
          },
          {
            url: samplePhotosPool[9],
            year: "2025",
            topic: "Du lịch",
            caption: "Hành trình thanh xuân",
          },
        ],
        "Phan Lạc Quốc Anh": [
          {
            url: samplePhotosPool[1],
            year: "2026",
            topic: "Chân dung",
            caption: "Kỷ yếu đáng nhớ",
          },
          {
            url: samplePhotosPool[10],
            year: "2025",
            topic: "Chân dung",
            caption: "Khoảnh khắc suy tư",
          },
        ],
      };

      let eventsData = JSON.parse(JSON.stringify(baseEventsData));
      let memberPhotosData = JSON.parse(JSON.stringify(baseMemberPhotosData));
      let guestbookNotes = [];

      // FIREBASE REALTIME PHOTOS SYNC
      function initPhotosSync() {
        if (!window.db) return;
        const q = window.query(
          window.collection(window.db, "photos"),
          window.orderBy("createdAt", "desc"),
        );
        window.onSnapshot(q, (snapshot) => {
          eventsData = JSON.parse(JSON.stringify(baseEventsData));
          memberPhotosData = JSON.parse(JSON.stringify(baseMemberPhotosData));

          snapshot.forEach((doc) => {
            const data = doc.data();
            const target = data.target;
            const photoUrl = data.url;
            const caption = data.caption || "Khoảnh khắc thanh xuân";
            const year = data.year || "2026";
            const topic = data.topic || "Du lịch";

            if (target && target.startsWith("event_")) {
              const eventId = parseInt(target.replace("event_", ""));
              const ev = eventsData.find((e) => e.id === eventId);
              if (ev) {
                ev.photos.unshift(photoUrl);
                if (!ev.cover || ev.cover.startsWith("http")) {
                  ev.cover = photoUrl;
                }
              }
            } else if (target && target.startsWith("member_")) {
              const memberName = target.replace("member_", "");
              if (!memberPhotosData[memberName]) {
                memberPhotosData[memberName] = [];
              }
              memberPhotosData[memberName].unshift({
                url: photoUrl,
                year: year,
                topic: topic,
                caption: caption,
              });
            }
          });

          renderEvents();
          if (
            currentMemberName &&
            document
              .getElementById("member-modal")
              .classList.contains("pointer-events-none") === false
          ) {
            renderMemberPhotos();
          }
        });
      }

      // FIREBASE REALTIME GUESTBOOK SYNC
      function initGuestbookSync() {
        if (!window.db) return;
        const q = window.query(
          window.collection(window.db, "guestbooks"),
          window.orderBy("createdAt", "desc"),
        );
        window.onSnapshot(q, (snapshot) => {
          guestbookNotes = [];
          snapshot.forEach((doc) => {
            guestbookNotes.push({ id: doc.id, ...doc.data() });
          });
          renderGuestbook();
        });
      }

      // Render Homepage Event Cover Cards
      const eventsContainer = document.getElementById("events-container");

      function renderEvents() {
        if (!eventsContainer) return;
        eventsContainer.innerHTML = "";
        eventsData.forEach((event) => {
          const card = document.createElement("div");
          card.className =
            "earthy-card rounded-3xl overflow-hidden shadow-xl cursor-pointer group hover:border-terracotta/50 transition-all duration-300";
          card.onclick = () => {
            if (event.isBirthdayEvent) {
              openBirthdaySubModal();
            } else {
              openEventModal(event.id);
            }
          };
          card.innerHTML = `
                    <div class="relative overflow-hidden aspect-[16/10] bg-espresso/10">
                        <img src="${event.cover}" alt="${event.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" loading="lazy">
                        <div class="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent opacity-70 group-hover:opacity-50 transition-opacity"></div>
                        <span class="absolute top-3 left-3 px-3 py-1 rounded-full bg-espresso/70 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-warmCream uppercase tracking-wider">
                            <i class="fa-solid fa-images mr-1"></i> ${event.photos.length} Khoảnh Khắc ${event.isBirthdayEvent ? "(Sub-Albums)" : ""}
                        </span>
                        <div class="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-terracotta text-white text-xs font-semibold shadow-md">
                            Xem Album <i class="fa-solid fa-arrow-right ml-1"></i>
                        </div>
                    </div>
                    <div class="p-5">
                        <div class="text-xs text-terracotta font-mono font-semibold mb-1"><i class="fa-regular fa-calendar mr-1.5"></i>${event.date}</div>
                        <h3 class="text-xl font-bold text-espresso mb-2 group-hover:text-terracotta transition-colors font-serif">${event.title}</h3>
                        <p class="text-espresso/80 text-xs line-clamp-2 font-light">${event.description}</p>
                    </div>
                `;
          eventsContainer.appendChild(card);
        });
      }

      // Open Regular Event Modal
      const eventModal = document.getElementById("event-modal");
      const modalEventTitle = document.getElementById("modal-event-title");
      const modalEventDate = document.getElementById("modal-event-date");
      const modalEventDesc = document.getElementById("modal-event-desc");
      const modalEventCount = document.getElementById("modal-event-count");
      const modalAlbumGrid = document.getElementById("modal-album-grid");

      function openEventModal(eventId) {
        const event = eventsData.find((e) => e.id === eventId);
        if (!event) return;

        modalEventTitle.textContent = event.title;
        modalEventDate.textContent = event.date;
        modalEventDesc.textContent = event.description;
        modalEventCount.textContent = `${event.photos.length} ảnh`;

        modalAlbumGrid.innerHTML = "";
        event.photos.forEach((photoUrl, index) => {
          const photoCard = document.createElement("div");
          photoCard.className =
            "aspect-square rounded-2xl overflow-hidden bg-espresso/10 cursor-pointer group shadow-md opacity-0 scale-95";
          photoCard.innerHTML = `
                    <img src="${photoUrl}" alt="Album photo ${index + 1}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onclick="openLightbox('${photoUrl}', '${event.title} - Ảnh ${index + 1}')">
                `;
          modalAlbumGrid.appendChild(photoCard);
        });

        eventModal.classList.remove("pointer-events-none");
        gsap.to(eventModal, { opacity: 1, duration: 0.3 });
        document.body.style.overflow = "hidden";

        gsap.to(modalAlbumGrid.children, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.03,
          ease: "power2.out",
          delay: 0.1,
        });
      }

      function closeEventModal() {
        gsap.to(eventModal, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            eventModal.classList.add("pointer-events-none");
            document.body.style.overflow = "auto";
          },
        });
      }

      // Birthday Sub-Albums Modal
      const birthdaySubModal = document.getElementById("birthday-submodal");
      const birthdaySubalbumsList = document.getElementById(
        "birthday-subalbums-list",
      );

      function openBirthdaySubModal() {
        birthdaySubalbumsList.innerHTML = "";

        const subAlbumsData = [
          {
            name: "Nguyễn Hương Giang",
            year: "2025",
            cover: samplePhotosPool[3],
          },
          {
            name: "Đỗ Hữu Tuân",
            year: "2025",
            cover: samplePhotosPool[4],
          },
          {
            name: "Chu Thị Lan Anh",
            year: "2025",
            cover: samplePhotosPool[5],
          },
          {
            name: "Nguyễn Văn Đạt",
            year: "2025",
            cover: samplePhotosPool[6],
          },
          {
            name: "Nguyễn Tuấn Anh",
            year: "2025",
            cover: samplePhotosPool[7],
          },
          {
            name: "Phan Lạc Quốc Anh",
            year: "2025",
            cover: samplePhotosPool[8],
          },
        ];

        subAlbumsData.forEach((sub) => {
          const card = document.createElement("div");
          card.className =
            "earthy-card rounded-2xl overflow-hidden shadow-lg cursor-pointer group hover:border-terracotta transition";
          card.onclick = () => {
            closeBirthdaySubModal();
            openMemberGallery(sub.name);
          };
          card.innerHTML = `
                    <div class="relative aspect-video bg-espresso/10 overflow-hidden">
                        <img src="${sub.cover}" alt="${sub.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
                        <span class="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-espresso/70 text-warmCream text-[10px] font-mono font-semibold">Năm ${sub.year}</span>
                    </div>
                    <div class="p-4">
                        <h4 class="font-bold text-espresso font-serif text-base group-hover:text-terracotta transition">Sinh nhật ${sub.name}</h4>
                        <p class="text-xs text-espresso/70 font-light mt-0.5">Bộ sưu tập ảnh kỷ niệm sinh nhật tuổi 20.</p>
                    </div>
                `;
          birthdaySubalbumsList.appendChild(card);
        });

        birthdaySubModal.classList.remove("pointer-events-none");
        gsap.to(birthdaySubModal, { opacity: 1, duration: 0.3 });
        document.body.style.overflow = "hidden";
      }

      function closeBirthdaySubModal() {
        gsap.to(birthdaySubModal, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            birthdaySubModal.classList.add("pointer-events-none");
            document.body.style.overflow = "auto";
          },
        });
      }

      // Lightbox functions
      const lightbox = document.getElementById("lightbox");
      const lightboxImg = document.getElementById("lightbox-img");
      const lightboxCaption = document.getElementById("lightbox-caption");

      function openLightbox(url, caption) {
        lightboxImg.src = url;
        lightboxCaption.textContent = caption;
        lightbox.classList.remove("pointer-events-none");
        gsap.to(lightbox, { opacity: 1, duration: 0.3 });
      }

      function closeLightbox() {
        gsap.to(lightbox, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => lightbox.classList.add("pointer-events-none"),
        });
      }

      // Guestbook functions (Cloud Realtime)
      function renderGuestbook() {
        const container = document.getElementById("guestbook-container");
        if (!container) return;
        container.innerHTML = "";

        if (guestbookNotes.length === 0) {
          container.innerHTML = `<div class="text-center py-6 text-espresso/50 text-xs italic">Chưa có lời nhắn nào. Hãy là người đầu tiên gửi lời chúc! 💌</div>`;
          return;
        }

        guestbookNotes.forEach((note) => {
          const item = document.createElement("div");
          item.className =
            "bg-white/60 p-4 rounded-2xl border border-espresso/10 shadow-sm";
          item.innerHTML = `
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-bold text-espresso text-sm">${note.author}</span>
                        <span class="text-[10px] font-mono text-espresso/50">${note.date}</span>
                    </div>
                    <p class="text-espresso/80 text-xs sm:text-sm font-light">${note.message}</p>
                `;
          container.appendChild(item);
        });
      }

      async function addGuestbookNote() {
        const authorInput = document.getElementById("guestbook-author");
        const messageInput = document.getElementById("guestbook-message");
        const author = authorInput.value.trim();
        const message = messageInput.value.trim();

        if (!author || !message) {
          showToast("Vui lòng nhập tên và nội dung lời nhắn!");
          return;
        }

        const today = new Date();
        const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

        try {
          showToast("Đang gửi lời nhắn lên Cloud...");
          await window.addDoc(window.collection(window.db, "guestbooks"), {
            author,
            message,
            date: dateStr,
            createdAt: new Date(),
          });

          authorInput.value = "";
          messageInput.value = "";
          showToast("Đã gửi lời nhắn lên sổ lưu bút thành công! ✨");
        } catch (error) {
          console.error("Lỗi gửi lưu bút:", error);
          showToast("Có lỗi xảy ra, vui lòng thử lại!");
        }
      }

      // Member Personal Photo Galleries Data & Functions
      let currentMemberName = "";
      let currentMemberFilter = "all";

      const memberModal = document.getElementById("member-modal");
      const modalMemberName = document.getElementById("modal-member-name");
      const modalMemberCount = document.getElementById("modal-member-count");
      const modalMemberGrid = document.getElementById("modal-member-grid");
      const memberSearchInput = document.getElementById("member-search-input");

      function openMemberGallery(memberName) {
        closeInfoModal();
        closeBirthdaySubModal();
        currentMemberName = memberName;
        currentMemberFilter = "all";
        if (memberSearchInput) memberSearchInput.value = "";

        const filterBtns = document.querySelectorAll(
          "#member-filter-buttons .filter-btn",
        );
        filterBtns.forEach((b) => {
          b.classList.remove("bg-terracotta", "text-white");
          b.classList.add("bg-white/70", "text-espresso/80");
        });
        if (filterBtns[0]) {
          filterBtns[0].classList.add("bg-terracotta", "text-white");
          filterBtns[0].classList.remove("bg-white/70", "text-espresso/80");
        }

        renderMemberPhotos();

        memberModal.classList.remove("pointer-events-none");
        gsap.to(memberModal, { opacity: 1, duration: 0.3 });
        document.body.style.overflow = "hidden";
      }

      function setMemberFilter(filter, btn) {
        currentMemberFilter = filter;
        const filterBtns = document.querySelectorAll(
          "#member-filter-buttons .filter-btn",
        );
        filterBtns.forEach((b) => {
          b.classList.remove("bg-terracotta", "text-white");
          b.classList.add("bg-white/70", "text-espresso/80");
        });
        btn.classList.add("bg-terracotta", "text-white");
        btn.classList.remove("bg-white/70", "text-espresso/80");

        renderMemberPhotos();
      }

      function filterMemberPhotos() {
        renderMemberPhotos();
      }

      function renderMemberPhotos() {
        const rawPhotos = memberPhotosData[currentMemberName] || [];
        const searchTerm = memberSearchInput
          ? memberSearchInput.value.toLowerCase().trim()
          : "";

        const filtered = rawPhotos.filter((item) => {
          const matchesFilter =
            currentMemberFilter === "all" ||
            item.year === currentMemberFilter ||
            item.topic === currentMemberFilter;
          const matchesSearch =
            item.caption.toLowerCase().includes(searchTerm) ||
            item.year.toLowerCase().includes(searchTerm) ||
            item.topic.toLowerCase().includes(searchTerm);
          return matchesFilter && matchesSearch;
        });

        modalMemberName.textContent = currentMemberName;
        modalMemberCount.textContent = `${filtered.length} ảnh`;

        modalMemberGrid.innerHTML = "";
        if (filtered.length === 0) {
          modalMemberGrid.innerHTML = `<div class="col-span-full py-12 text-center text-espresso/60 text-sm italic bg-white/40 rounded-2xl border border-espresso/10">Không tìm thấy khoảnh khắc phù hợp với bộ lọc hoặc từ khóa.</div>`;
          return;
        }

        filtered.forEach((item, index) => {
          const photoCard = document.createElement("div");
          photoCard.className =
            "aspect-square rounded-2xl overflow-hidden bg-espresso/10 cursor-pointer group shadow-md opacity-0 scale-95 relative";
          photoCard.innerHTML = `
                    <img src="${item.url}" alt="${currentMemberName} photo ${index + 1}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onclick="openLightbox('${item.url}', '${currentMemberName} - ${item.caption} (${item.year})')">
                    <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-espresso/80 via-espresso/40 to-transparent p-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end text-[11px] text-white">
                        <span class="truncate font-light">${item.caption}</span>
                        <span class="font-mono text-warmCream font-semibold">${item.year}</span>
                    </div>
                `;
          modalMemberGrid.appendChild(photoCard);
        });

        gsap.to(modalMemberGrid.children, {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.03,
          ease: "power2.out",
          delay: 0.1,
        });
      }

      function closeMemberModal() {
        gsap.to(memberModal, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            memberModal.classList.add("pointer-events-none");
            document.body.style.overflow = "auto";
          },
        });
      }

      // Upload Photo Modal Logic (Firebase Storage & Firestore)
      const uploadModal = document.getElementById("upload-modal");

      function openUploadModal() {
        uploadModal.classList.remove("pointer-events-none");
        gsap.to(uploadModal, { opacity: 1, duration: 0.3 });
      }

      function closeUploadModal() {
        gsap.to(uploadModal, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => uploadModal.classList.add("pointer-events-none"),
        });
      }

      async function handlePhotoUpload() {
        const fileInput = document.getElementById("upload-file-input");
        const captionInput = document.getElementById("upload-caption-input");
        const targetSelect = document.getElementById("upload-target-select");

        const caption = captionInput.value.trim() || "Khoảnh khắc thanh xuân";
        const targetVal = targetSelect.value;

        if (!fileInput.files || fileInput.files.length === 0) {
          showToast("Vui lòng chọn một hình ảnh từ thiết bị!");
          return;
        }

        const file = fileInput.files[0];
        showToast("Đang tải ảnh lên Cloudinary...");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "apqulm69"); // 👈 Dùng đúng preset bạn vừa tạo

        try {
          const response = await fetch(
            "https://api.cloudinary.com/v1_1/ddru6qfcv/image/upload", // 👈 Dùng đúng Cloud Name của bạn
            {
              method: "POST",
              body: formData,
            },
          );

          const data = await response.json();
          if (!data.secure_url) {
            throw new Error("Không nhận được đường dẫn URL từ Cloudinary");
          }

          const imageUrl = data.secure_url;

          // Lưu URL ngắn gọn vào Firestore Database (nhẹ tênh, không sợ lỗi dung lượng)
          await window.addDoc(window.collection(window.db, "photos"), {
            url: imageUrl,
            caption: caption,
            target: targetVal,
            year: "2026",
            topic: targetVal.startsWith("member_") ? "Chân dung" : "Du lịch",
            createdAt: new Date(),
          });

          fileInput.value = "";
          captionInput.value = "";
          closeUploadModal();
          showToast("Đã tải ảnh lên và đồng bộ cho cả 6 thành viên! ✨");
        } catch (error) {
          console.error("Lỗi upload ảnh:", error);
          showToast("Có lỗi xảy ra khi tải ảnh lên Cloudinary!");
        }
      }

      // Navigation helpers & Modals
      function scrollToTop() {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      const infoModal = document.getElementById("info-modal");

      function showInfoModal() {
        infoModal.classList.remove("pointer-events-none");
        gsap.to(infoModal, { opacity: 1, duration: 0.3 });
      }

      function closeInfoModal() {
        gsap.to(infoModal, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => infoModal.classList.add("pointer-events-none"),
        });
      }

      function showGuestbookFocus() {
        document
          .getElementById("guestbook-section")
          .scrollIntoView({ behavior: "smooth" });
      }
