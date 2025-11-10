document.addEventListener('DOMContentLoaded', () => {
  initHeader();

});

function initHeader() {
  const $backBtn = document.querySelector('.header-action.header-action-left');
  const $profileWrapper = document.querySelector('.profile-image-wrapper');
  if ($backBtn) {
    // 루트가 아니라면 뒤로 가기 버튼은 숨겨야함
    if (document.referrer && document.referrer !== location.href) {
      $backBtn.classList.remove("hidden");
    } else {
      $backBtn.classList.add("hidden");
    }

    // 뒤로가기 버튼 이벤트 추가
    $backBtn.addEventListener('click', () => {
      if (document.referrer && document.referrer !== location.href) {
        history.back();
      }
    });
  }

  if ($profileWrapper) {
    initProfileDropdown($profileWrapper);
  }
}

function initProfileDropdown($wrapper) {
  const dropdown = document.createElement("div");
  dropdown.className = "profile-menu hide";
  dropdown.innerHTML = `
    <button type="button" data-action="profile-edit">회원정보수정</button>
    <button type="button" data-action="password-change">비밀번호수정</button>
    <button type="button" data-action="logout">로그아웃</button>
  `;
  document.body.appendChild(dropdown);

  const positionDropdown = () => {
    const rect = $wrapper.getBoundingClientRect();
    dropdown.style.top = `${rect.bottom + 12 + window.scrollY}px`;
    dropdown.style.left = `${rect.left + window.scrollX - (dropdown.offsetWidth / 2) + rect.width / 2}px`;
  };

  const toggleDropdown = () => {
    dropdown.classList.toggle("hide");
    dropdown.classList.toggle("show");
    if (!dropdown.classList.contains("hide")) {
      positionDropdown();
    }
  };

  $wrapper.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleDropdown();
  });

  document.addEventListener("click", () => {
    dropdown.classList.add("hide");
    dropdown.classList.remove("show");
  });

  dropdown.addEventListener("click", (event) => {
    event.stopPropagation();
    const action = event.target.dataset.action;
    if (!action) return;

    if (action === "profile-edit") {
      window.location.href = "/page/profileEdit.html";
    } else if (action === "password-change") {
      window.location.href = "/page/passwordChange.html";
    } else if (action === "logout") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("nickname");
      localStorage.removeItem("profile_image_url");
      window.location.replace("/page/login.html");
    }
    dropdown.classList.add("hide");
    dropdown.classList.remove("show");
  });
}
