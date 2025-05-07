document.addEventListener("DOMContentLoaded", () => {
  // 화면 요소 참조
  const inputScreen = document.getElementById("input-screen");
  const loadingScreen = document.getElementById("loading-screen");
  const resultScreen = document.getElementById("result-screen");

  // 입력 요소 참조
  const genderButtons = document.querySelectorAll(".gender-button");
  const ageInput = document.getElementById("age-input");
  const photoInput = document.getElementById("photo-input");
  const uploadArea = document.getElementById("upload-area");
  const previewImage = document.getElementById("preview-image");
  const submitButton = document.getElementById("submit-button");

  // 결과 요소 참조
  const productBrand = document.getElementById("product-brand");
  const productModel = document.getElementById("product-model");
  const productImage = document.getElementById("product-image");
  const recommendedName = document.getElementById("recommended-name");
  const productDescription = document.getElementById("product-description");
  const shareButton = document.getElementById("share-button");
  const restartButton = document.getElementById("restart-button");

  // 상태 변수
  let selectedGender = null;
  let selectedAge = null;
  let uploadedPhoto = null;
  let detectedShapeIndex = null;       // 추가: 얼굴형 인덱스 저장
  let detectedShapeName = null;        // 추가: 얼굴형 이름 저장
  let selectedProduct = null;

  // 슬라이더 이미지 요소와 데이터
  const sliderImage = document.querySelector(".slider-image");
  let sliderImages = [];
  let currentImageIndex = 0;

  // 초기 데이터 로드 및 슬라이더 설정
  loadInitialData();

  // 초기 데이터 로드 함수
  async function loadInitialData() {
    try {
      const products = await loadProductData();
      sliderImages = products.map((product) => product.productImage);
      if (sliderImages.length > 0) {
        sliderImage.src = sliderImages[0];
        startImageSlider();
      }
    } catch (error) {
      console.error("초기 데이터 로드 중 오류 발생:", error);
    }
  }

  // 이미지 슬라이더 시작 함수
  function startImageSlider() {
    setInterval(() => {
      sliderImage.classList.add("fade");
      setTimeout(() => {
        currentImageIndex = (currentImageIndex + 1) % sliderImages.length;
        sliderImage.src = sliderImages[currentImageIndex];
        sliderImage.classList.remove("fade");
      }, 500);
    }, 4000);
  }

  // 사진 업로드 처리 함수
  function handleFileUpload(file) {
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }
    const loadingModal = document.getElementById("loading-modal");
    loadingModal.style.display = "flex";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("gender", selectedGender);  // 선택된 성별 추가
    formData.append("age", selectedAge);        // 선택된 나이 추가

    fetch("/api/is-face", {                   // 백엔드 엔드포인트
      method: "POST",
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        loadingModal.style.display = "none";
        if (data.result) {
          // 얼굴 검증 및 인덱스 저장
          detectedShapeIndex = data.shape_index;
          detectedShapeName = data.shape_name;

          // 미리보기 표시
          uploadedPhoto = file;
          const reader = new FileReader();
          reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.style.display = "block";
            const uploadButtonContent = uploadArea.querySelector(
              ".upload-button-content"
            );
            if (uploadButtonContent) uploadButtonContent.style.display = "none";
            uploadArea.style.height = "auto";
            uploadArea.style.borderRadius = "15px";
            uploadArea.style.padding = "10px";

            checkSubmitButton();
          };
          reader.readAsDataURL(file);
        } else {
          alert("다수의 얼굴 혹은 사람 얼굴이 감지되지 않았습니다.");
        }
      })
      .catch(error => {
        loadingModal.style.display = "none";
        console.error("사진 분석 오류:", error);
        alert("서버 오류로 얼굴 판별에 실패했습니다.");
      });
  }

  // 파일 업로드 이벤트 바인딩
  uploadArea.addEventListener("click", () => photoInput.click());
  uploadArea.addEventListener("dragover", e => { e.preventDefault(); uploadArea.classList.add("drag-over"); });
  uploadArea.addEventListener("dragleave", () => uploadArea.classList.remove("drag-over"));
  uploadArea.addEventListener("drop", e => {
    e.preventDefault(); uploadArea.classList.remove("drag-over");
    if (e.dataTransfer.files.length > 0) handleFileUpload(e.dataTransfer.files[0]);
  });
  photoInput.addEventListener("change", () => {
    if (photoInput.files.length > 0) handleFileUpload(photoInput.files[0]);
  });

  // 성별/나이 선택 로직 (생략: 기존과 동일)
  genderButtons.forEach(button => {
    button.addEventListener("click", () => {
      genderButtons.forEach(btn => btn.classList.remove("selected"));
      button.classList.add("selected");
      selectedGender = button.dataset.gender;
      checkSubmitButton();
    });
  });

  ageInput.addEventListener("input", () => {
    const ageValue = parseInt(ageInput.value);
    const errorMessage = document.getElementById("age-error-message");
    if (ageValue >= 15 && ageValue <= 100) {
      selectedAge = ageValue;
      if (errorMessage) errorMessage.remove();
    } else if (ageInput.value !== "") {
      selectedAge = null;
      if (!errorMessage) {
        const msg = document.createElement("span");
        msg.id = "age-error-message";
        msg.style.color = "#ff3b30";
        msg.style.fontSize = "12px";
        msg.textContent = "15-100세만 가능";
        ageInput.parentNode.insertBefore(msg, ageInput.nextSibling);
      }
    } else {
      selectedAge = null;
    }
    checkSubmitButton();
  });

  // 제출 버튼 활성화
  function checkSubmitButton() {
    submitButton.disabled = !(selectedGender && selectedAge && uploadedPhoto);
  }

  // 분석 시작 및 추천 상품 로드
  function startAnalysis() {
    inputScreen.style.display = "none";
    loadingScreen.style.display = "block";

    const analysisImage = document.getElementById("analysis-image");
    if (uploadedPhoto) analysisImage.src = previewImage.src;

    const texts = [
      document.getElementById("analysis-text-1"),
      document.getElementById("analysis-text-2"),
      document.getElementById("analysis-text-3"),
    ];
    texts[0].style.display = "block";

    // 애니메이션 순서 유지 (기존과 동일)
    setTimeout(() => {
      texts[0].style.animation = "fadeOutDown 0.3s forwards";
      setTimeout(() => { texts[0].style.display = "none"; texts[1].style.display = "block"; texts[1].style.animation = "fadeInUp 0.3s forwards"; }, 300);
    }, 3000);

    setTimeout(() => {
      texts[1].style.animation = "fadeOutDown 0.3s forwards";
      setTimeout(() => {
        texts[1].style.display = "none";
        texts[2].style.display = "block";
        texts[2].style.animation = "fadeInUp 0.3s forwards";

        setTimeout(async () => {
          // 데이터 로드 후 shape_index 기반 추천
          const products = await loadProductData();
          selectedProduct = products.find(p => parseInt(p.id) === detectedShapeIndex);
          if (!selectedProduct) selectedProduct = products[0];
          window.location.href = `result.html?id=${selectedProduct.id}`;
        }, 700);
      }, 300);
    }, 6000);
  }

  submitButton.addEventListener("click", startAnalysis);

  // 데이터 로드 함수 (기존)
  async function loadProductData() {
    try {
      const response = await fetch("data.json");
      return await response.json();
    } catch (error) {
      console.error("데이터 로드 중 오류 발생:", error);
      return [];
    }
  }

  // 공유 버튼
  shareButton.addEventListener("click", () => {
    const shareTitle = "맞춤 선글라스 추천";
    const shareText = `${recommendedName.textContent} - ${productBrand.textContent} ${productModel.textContent}`;
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({ title: shareTitle, text: shareText, url: shareUrl }).catch(err => alert("공유 실패"));
    } else alert("이 브라우저에서는 공유 기능을 지원하지 않습니다.");
  });

  // 다시 시도
  restartButton.addEventListener("click", () => window.location.href = "index.html");
});
