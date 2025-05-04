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
      // 데이터 로드
      const products = await loadProductData();

      // 슬라이더 이미지 배열 설정
      sliderImages = products.map((product) => product.productImage);

      // 첫 번째 이미지 표시
      if (sliderImages.length > 0) {
        sliderImage.src = sliderImages[0];

        // 이미지 슬라이더 시작
        startImageSlider();
      }
    } catch (error) {
      console.error("초기 데이터 로드 중 오류 발생:", error);
    }
  }

  // 이미지 슬라이더 시작 함수
  function startImageSlider() {
    // 4초마다 이미지 변경
    setInterval(() => {
      // 현재 이미지 페이드 아웃
      sliderImage.classList.add("fade");

      // 0.5초 후 다음 이미지로 변경 및 페이드 인
      setTimeout(() => {
        // 다음 이미지 인덱스 설정
        currentImageIndex = (currentImageIndex + 1) % sliderImages.length;

        // 다음 이미지 표시
        sliderImage.src = sliderImages[currentImageIndex];

        // 페이드 인
        sliderImage.classList.remove("fade");
      }, 500);
    }, 4000);
  }

  // 성별 버튼 이벤트 리스너
  genderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 이전에 선택된 버튼의 선택 상태 제거
      genderButtons.forEach((btn) => btn.classList.remove("selected"));

      // 현재 버튼 선택 상태로 변경
      button.classList.add("selected");

      // 선택된 성별 저장
      selectedGender = button.dataset.gender;

      // 제출 버튼 활성화 상태 확인
      checkSubmitButton();
    });
  });

  // 나이 입력 이벤트 리스너
  ageInput.addEventListener("input", () => {
    const ageValue = parseInt(ageInput.value);
    
    if (ageValue >= 15 && ageValue <= 100) {
      selectedAge = ageValue;
      // 입력된 나이가 유효한 범위내일 때 에러 메시지 있었다면 제거
      const errorMessage = document.getElementById('age-error-message');
      if (errorMessage) {
        errorMessage.remove();
      }
    } else if (ageInput.value !== '') {
      selectedAge = null;
      
      // 이미 에러 메시지가 있는지 확인
      let errorMessage = document.getElementById('age-error-message');
      
      if (!errorMessage) {
        // 에러 메시지 생성
        errorMessage = document.createElement('span');
        errorMessage.id = 'age-error-message';
        errorMessage.style.color = '#ff3b30';
        errorMessage.style.fontSize = '12px';
        errorMessage.style.marginRight = '5px';
        errorMessage.textContent = '15-100세만 가능';
        
        // 에러 메시지 추가
        const ageSuffix = document.querySelector('.age-suffix');
        ageSuffix.parentNode.insertBefore(errorMessage, ageSuffix);
      }
    } else {
      selectedAge = null;
    }
    
    checkSubmitButton();
  });

  // 사진 업로드 영역 클릭 이벤트
  uploadArea.addEventListener("click", () => {
    photoInput.click();
  });

  // 파일 드래그 앤 드롭 이벤트
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("drag-over");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("drag-over");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");

    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  });

  // 파일 입력 변경 이벤트
  photoInput.addEventListener("change", () => {
    if (photoInput.files.length > 0) {
      handleFileUpload(photoInput.files[0]);
    }
  });

  // 파일 업로드 처리 함수
  function handleFileUpload(file) {
    if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        return;
    }

    // Flask API로 이미지 전송
    const formData = new FormData();
    formData.append("file", file);

    fetch("https://huggingface.co/spaces/pizzzaboy/deepface/api/is-face", {  // EC2 퍼블릭 IP로 변경
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.result) {
            // 얼굴이 감지된 경우 기존 미리보기·분석 로직 실행
            uploadedPhoto = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                previewImage.style.display = "block";
                const uploadButtonContent = uploadArea.querySelector(".upload-button-content");
                if (uploadButtonContent) {
                    uploadButtonContent.style.display = "none";
                }

                // upload-area의 height 속성 제거
                uploadArea.style.height = "auto";
                uploadArea.style.borderRadius = "15px";
                uploadArea.style.padding = "10px";

                // 제출 버튼 활성화 상태만 확인
                checkSubmitButton();
            };
            reader.readAsDataURL(file);
        } else {
            alert("사진에서 얼굴이 감지되지 않았습니다.");
        }
    })
    .catch(() => {
        alert("서버 오류로 얼굴 판별에 실패했습니다.");
    });
  }


  // 제출 버튼 활성화 상태 확인 함수
  function checkSubmitButton() {
    if (selectedGender && selectedAge && uploadedPhoto) {
      submitButton.disabled = false;
    } else {
      submitButton.disabled = true;
    }
  }

  // 분석 시작 함수
  function startAnalysis() {
    // 로딩 화면으로 전환
    inputScreen.style.display = "none";
    loadingScreen.style.display = "block";

    // 업로드된 사진을 분석 화면에 표시
    const analysisImage = document.getElementById("analysis-image");
    if (uploadedPhoto && previewImage.src) {
      analysisImage.src = previewImage.src;
    }

    // 로딩 텍스트 요소 참조
    const analysisText1 = document.getElementById("analysis-text-1");
    const analysisText2 = document.getElementById("analysis-text-2");
    const analysisText3 = document.getElementById("analysis-text-3");

    // 첫 번째 텍스트 상태 (애니메이션 없이 바로 표시)
    analysisText1.style.display = "block";

    // 3초 후 첫 번째 텍스트 페이드 아웃 및 두 번째 텍스트 페이드 인
    setTimeout(() => {
      // 첫 번째 텍스트 페이드 아웃
      analysisText1.style.animation = "fadeOutDown 0.3s forwards";

      // 두 번째 텍스트 표시 및 페이드 인
      setTimeout(() => {
        analysisText1.style.display = "none";
        analysisText2.style.display = "block";
        analysisText2.style.animation = "fadeInUp 0.3s forwards";
      }, 300);
    }, 3000);

    // 6초 후 두 번째 텍스트 페이드 아웃 및 세 번째 텍스트 페이드 인
    setTimeout(() => {
      // 두 번째 텍스트 페이드 아웃
      analysisText2.style.animation = "fadeOutDown 0.3s forwards";

      // 세 번째 텍스트 표시 및 페이드 인
      setTimeout(() => {
        analysisText2.style.display = "none";
        analysisText3.style.display = "block";
        analysisText3.style.animation = "fadeInUp 0.3s forwards";

        // 정확히 5초 후 결과 화면으로 전환
        setTimeout(() => {
          // 데이터 로드 및 랜덤 선글라스 선택
          loadProductData().then((products) => {
            // 랜덤 선글라스 선택
            selectedProduct = getRandomProduct(products);

            // result.html 페이지로 리다이렉션
            window.location.href = `result.html?id=${selectedProduct.id}`;
          });
        }, 700); // 마지막 텍스트 표시 후 약 0.7초 뒤 전환
      }, 300);
    }, 6000);
  }

  // 제출 버튼 클릭 이벤트
  submitButton.addEventListener("click", () => {
    startAnalysis();
  });

  // 데이터 로드 함수
  async function loadProductData() {
    try {
      const response = await fetch("data.json");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("데이터 로드 중 오류 발생:", error);
      // 에러 발생 시 대체 데이터 반환
      return [
        {
          id: 1,
          brandName: "젠틀몬스터",
          modelNumber: "MM003-01",
          productImage:
            "https://cdn.glitch.global/bd9b1c4c-1d7c-4fa9-bb07-73ea8b27ea24/default_sunglasses.jpg?v=1713406798077",
          recommendedName: "차가운 도시남자 핏",
          description:
            "세련된 디자인과 견고한 프레임으로 도시적인 감각을 표현하는 선글라스입니다. 비대칭 디자인과 둥근 디테일이 조화롭게 어우러져 독특한 매력을 연출합니다.",
        },
        {
          id: 2,
          brandName: "레이밴",
          modelNumber: "RB2180",
          productImage:
            "https://cdn.glitch.global/bd9b1c4c-1d7c-4fa9-bb07-73ea8b27ea24/default_sunglasses2.jpg?v=1713406798129",
          recommendedName: "클래식 빈티지 스타일",
          description:
            "클래식한 디자인으로 시간이 지나도 변하지 않는 멋을 선사합니다. 가벼운 무게와 편안한 착용감으로 일상에서 자주 사용하기 좋은 제품입니다.",
        },
        {
          id: 3,
          brandName: "프라다",
          modelNumber: "SPR53U",
          productImage:
            "https://cdn.glitch.global/bd9b1c4c-1d7c-4fa9-bb07-73ea8b27ea24/default_sunglasses3.jpg?v=1713406798181",
          recommendedName: "럭셔리 패션 아이템",
          description:
            "세련된 디자인과 고급스러운 마감으로 당신의 패션 감각을 한층 업그레이드해 줍니다. 강렬한 인상을 주면서도 편안한 착용감을 제공합니다.",
        },
      ];
    }
  }

  // 랜덤 제품 선택 함수
  function getRandomProduct(products) {
    const randomIndex = Math.floor(Math.random() * products.length);
    return products[randomIndex];
  }

  // 결과 화면 업데이트 함수
  function updateResultScreen(product) {
    productBrand.textContent = product.brandName;
    productModel.textContent = product.modelNumber;
    productImage.src = product.productImage;
    recommendedName.textContent = product.recommendedName;
    productDescription.textContent = product.description;
  }

  // 공유 버튼 클릭 이벤트
  shareButton.addEventListener("click", () => {
    // 공유할 텍스트 정의
    const shareTitle = "맞춤 선글라스 추천";
    const shareText = `${selectedProduct.recommendedName} - ${selectedProduct.brandName} ${selectedProduct.modelNumber}`;
    const shareUrl = window.location.href;

    // Web Share API 지원 확인
    if (navigator.share) {
      navigator
        .share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
        .then(() => {
          console.log("공유 성공!");
        })
        .catch((error) => {
          console.log("공유 중 에러 발생:", error);
          alert("공유 기능을 사용할 수 없습니다.");
        });
    } else {
      // 웹 공유 API를 지원하지 않는 브라우저의 경우
      alert("이 브라우저에서는 공유 기능을 지원하지 않습니다.");
    }
  });

  // 다시 시도하기 버튼 클릭 이벤트
  restartButton.addEventListener("click", () => {
    // 입력값 초기화
    genderButtons.forEach((btn) => btn.classList.remove("selected"));
    ageInput.value = "";
    photoInput.value = "";
    previewImage.style.display = "none";
    previewImage.src = "";
    uploadArea.querySelector("svg").style.display = "block";
    uploadArea.querySelector("p").style.display = "block";

    // 상태 변수 초기화
    selectedGender = null;
    selectedAge = null;
    uploadedPhoto = null;
    selectedProduct = null;

    // 제출 버튼 비활성화
    submitButton.disabled = true;

    // 입력 화면으로 전환
    resultScreen.style.display = "none";
    inputScreen.style.display = "block";
  });
});
