document.addEventListener("DOMContentLoaded", async () => {
  // 결과 요소 참조
  const productBrand = document.getElementById("product-brand");
  const productModel = document.getElementById("product-model");
  const productImage = document.getElementById("product-image");
  const recommendedName = document.getElementById("recommended-name");
  const productDescription = document.getElementById("product-description");
  const shareButton = document.getElementById("share-button");
  const restartButton = document.getElementById("restart-button");

  // URL에서 id 파라미터 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    alert("잘못된 접근입니다. 메인 페이지로 이동합니다.");
    window.location.href = "index.html";
    return;
  }

  try {
    // 데이터 로드
    const products = await loadProductData();
    
    // ID에 해당하는 제품 찾기
    const selectedProduct = products.find(product => product.id.toString() === productId);
    
    if (!selectedProduct) {
      alert("해당 제품을 찾을 수 없습니다. 메인 페이지로 이동합니다.");
      window.location.href = "index.html";
      return;
    }
    
    // 결과 화면 업데이트
    updateResultScreen(selectedProduct);
  } catch (error) {
    console.error("데이터 로드 중 오류 발생:", error);
    alert("데이터를 불러오는 중 오류가 발생했습니다. 메인 페이지로 이동합니다.");
    window.location.href = "index.html";
  }

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
    const shareText = `${recommendedName.textContent} - ${productBrand.textContent} ${productModel.textContent}`;
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
    // 입력 화면으로 전환 (index.html로 이동)
    window.location.href = "index.html";
  });
});
