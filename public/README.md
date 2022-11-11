# Public 폴더

-   이미지
-   폰트
-   등의 정적 파일 위치

# Vite assets 참고사항

[공식문서](https://vitejs.dev/guide/assets.html)

```js
import 나의_이미지 from "./img.png";
document.getElementById("이미지_ID").src = 나의_의미지;
```

1.  Path prefix

    `public` 폴더에서 사진과 같은 asset을 불러올 때, 반드시 절대 경로를 사용해야 합니다.
    예) `public/icon.png` 는 `/icon.png` 경로롤 불러와야 합니다.

2.  Build result

    `나의_이미지` 는 **개발** 환경에서 `/나의_이미지.png` 로 , **production build** 환경에서는 `/assets/나의_이미지.2d8efhg.png`와 같은 결과가 나옵니다.

3.  Assets in public cannot be imported from JavaScript.
