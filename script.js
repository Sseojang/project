document.addEventListener("DOMContentLoaded", () => {
  // 화면 요소 참조
  const inputScreen = document.getElementById("input-screen");
  const loadingScreen = document.getElementById("loading-screen");
  const resultScreen = document.getElementById("result-screen");
  const genderButtons = document.querySelectorAll(".gender-button");
  const ageInput = document.getElementById("age-input");
  const photoInput = document.getElementById("photo-input");
  const uploadArea = document.getElementById("upload-area");
  const previewImage = document.getElementById("preview-image");
  const submitButton = document.getElementById("submit-button");
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
  let selectedProduct = null;

  // 슬라이더 관련
  const sliderImage = document.querySelector(".slider-image");
  let sliderImages = [];
  let currentImageIndex = 0;

  // 초기화 함수
  async function initialize() {
      try {
          const products = await loadProductData();
          sliderImages = products.map(product => product.productImage);
          if (sliderImages.length > 0) {
              sliderImage.src = sliderImages[0];
              startImageSlider();
          }
      } catch (error) {
          console.error("초기화 실패:", error);
      }
  }

  // 이미지 슬라이더
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

  // 성별 선택 핸들러
  genderButtons.forEach(button => {
      button.addEventListener("click", () => {
          genderButtons.forEach(btn => btn.classList.remove("selected"));
          button.classList.add("selected");
          selectedGender = button.dataset.gender;
          checkSubmitButton();
      });
  });

  // 나이 입력 핸들러
  ageInput.addEventListener("input", () => {
      const ageValue = parseInt(ageInput.value);
      const errorMessage = document.getElementById('age-error-message');
      
      if (ageValue >= 15 && ageValue <= 100) {
          selectedAge = ageValue;
          if (errorMessage) errorMessage.remove();
      } else if (ageInput.value !== '') {
          selectedAge = null;
          if (!errorMessage) {
              const ageSuffix = document.querySelector('.age-suffix');
              const newErrorMessage = document.createElement('span');
              newErrorMessage.id = 'age-error-message';
              newErrorMessage.style.cssText = 'color: #ff3b30; font-size: 12px; margin-right: 5px;';
              newErrorMessage.textContent = '15-100세만 가능';
              ageSuffix.parentNode.insertBefore(newErrorMessage, ageSuffix);
          }
      }
      checkSubmitButton();
  });

  // 파일 처리 핸들러 (개선된 버전)
  const processFile = (file) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
          if (!validateBase64(e.target.result)) {
              alert("잘못된 이미지 형식입니다");
              return;
          }

          const formData = new FormData();
          formData.append("file", file);

          try {
              const response = await fetch("https://eeolb2u26b.execute-api.us-east-2.amazonaws.com/prod/api/is-face", {
                  method: "POST",
                  body: formData
              });
              
              const result = await response.json();
              if (!response.ok) throw new Error(result.error);

              handleUploadResult(result, e.target.result);
          } catch (err) {
              alert(`업로드 실패: ${err.message}`);
          }
      };
      reader.readAsDataURL(file);
  };

  // Base64 유효성 검사
  const validateBase64 = (dataURL) => {
      const parts = dataURL.split(',');
      if (parts.length !== 2) return false;
      
      const [header, data] = parts;
      if (!header.startsWith('data:image/')) return false;
      
      try {
          atob(data);
          return true;
      } catch {
          return false;
      }
  };

  // 업로드 결과 처리
  const handleUploadResult = (result, previewSrc) => {
      uploadedPhoto = photoInput.files[0];
      previewImage.src = previewSrc;
      previewImage.style.display = "block";
      uploadArea.querySelector(".upload-button-content").style.display = "none";
      uploadArea.style.cssText = 'height: auto; border-radius: 15px; padding: 10px;';
      checkSubmitButton();
  };

  // 이벤트 바인딩
  uploadArea.addEventListener('click', () => photoInput.click());
  photoInput.addEventListener('change', (e) => e.target.files[0] && processFile(e.target.files[0]));
  
  uploadArea.addEventListener('dragover', (e) => e.preventDefault());
  uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      file && processFile(file);
  });

  // 제출 버튼 상태 관리
  function checkSubmitButton() {
      submitButton.disabled = !(selectedGender && selectedAge && uploadedPhoto);
  }

  // 분석 시작
  function startAnalysis() {
      inputScreen.style.display = "none";
      loadingScreen.style.display = "block";
      
      const analysisImage = document.getElementById("analysis-image");
      if (uploadedPhoto) analysisImage.src = previewImage.src;

      const [text1, text2, text3] = ['analysis-text-1', 'analysis-text-2', 'analysis-text-3']
          .map(id => document.getElementById(id));

      text1.style.display = "block";
      
      setTimeout(() => {
          text1.style.animation = "fadeOutDown 0.3s forwards";
          setTimeout(() => {
              text1.style.display = "none";
              text2.style.display = "block";
              text2.style.animation = "fadeInUp 0.3s forwards";
          }, 300);
      }, 3000);

      setTimeout(() => {
          text2.style.animation = "fadeOutDown 0.3s forwards";
          setTimeout(() => {
              text2.style.display = "none";
              text3.style.display = "block";
              text3.style.animation = "fadeInUp 0.3s forwards";
              setTimeout(() => window.location.href = `result.html?id=${selectedProduct.id}`, 700);
          }, 300);
      }, 6000);
  }

  submitButton.addEventListener("click", startAnalysis);

  // 데이터 로드
  async function loadProductData() {
      try {
          const response = await fetch("data.json");
          return await response.json();
      } catch (error) {
          console.error("데이터 로드 실패:", error);
          return [/* 기본 데이터 */];
      }
  }

  // 재시작 핸들러
  restartButton.addEventListener("click", () => {
      genderButtons.forEach(btn => btn.classList.remove("selected"));
      ageInput.value = "";
      photoInput.value = "";
      previewImage.style.display = "none";
      previewImage.src = "";
      uploadArea.querySelector("svg").style.display = "block";
      uploadArea.querySelector("p").style.display = "block";
      [selectedGender, selectedAge, uploadedPhoto, selectedProduct] = [null, null, null, null];
      submitButton.disabled = true;
      resultScreen.style.display = "none";
      inputScreen.style.display = "block";
  });

  initialize();
});
