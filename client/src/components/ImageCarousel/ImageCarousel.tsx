import { useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import Styles from "./ImageCarousel.module.css";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useTheme } from "../../context/ThemeContext.tsx/ThemeContext";

export interface ImageResponse {
  url: string;
  public_id: string;
  _id: string;
  id: string;
}

type Props = {
  imageUrls: ImageResponse[];
};

function ImageCarousel(props: Props) {
  const [index, setIndex] = useState(0);
  const { theme } = useTheme();

  const handleSelect = (selectedIndex: number) => {
    setIndex(selectedIndex);
  };

  const showControl: boolean = props.imageUrls.length > 1 ? true : false;

  return (
    <div className={Styles.carouselContainer}>
      <Carousel
        activeIndex={index}
        onSelect={handleSelect}
        variant={theme === "light" ? "dark" : "light"}
        controls={showControl}
        indicators={showControl}
        touch={true}
      >
        {props.imageUrls.map((image) => (
          <Carousel.Item key={image._id} className={Styles.imagesContainer}>
            <LazyLoadImage
              src={image.url}
              alt=""
              width={"100%"}
              className={Styles.carouselImage}
            />
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}

export default ImageCarousel;
