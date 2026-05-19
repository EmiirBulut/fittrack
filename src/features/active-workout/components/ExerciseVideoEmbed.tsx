import { Flex } from 'antd';
import { VideoCameraOutlined } from '@ant-design/icons';
import { getYouTubeEmbedUrl } from '../../../lib/youtubeUtils';

interface Props {
  youtubeUrl: string | null | undefined;
  imageUrl: string | null | undefined;
}

const ExerciseVideoEmbed = ({ youtubeUrl, imageUrl }: Props) => {
  const embedUrl = youtubeUrl ? getYouTubeEmbedUrl(youtubeUrl) : null;

  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        width="100%"
        height="300"
        title="Hareket videosu"
        allowFullScreen
        style={{ border: 'none', display: 'block', borderRadius: 8 }}
      />
    );
  }

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt="Hareket görseli"
        style={{
          width: '100%',
          height: 300,
          objectFit: 'cover',
          borderRadius: 8,
        }}
      />
    );
  }

  return (
    <Flex
      justify="center"
      align="center"
      style={{
        width: '100%',
        height: 200,
        backgroundColor: '#f0f4f0',
        borderRadius: 8,
      }}
    >
      <VideoCameraOutlined style={{ fontSize: 48, color: '#b0b0b0' }} />
    </Flex>
  );
};

export default ExerciseVideoEmbed;
