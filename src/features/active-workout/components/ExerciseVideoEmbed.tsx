import { Button, Flex } from 'antd';
import { LinkOutlined, VideoCameraOutlined } from '@ant-design/icons';
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
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        style={{ border: 'none', display: 'block', borderRadius: 8 }}
      />
    );
  }

  if (youtubeUrl) {
    return (
      <Flex
        vertical
        justify="center"
        align="center"
        gap={12}
        style={{
          width: '100%',
          height: 200,
          backgroundColor: '#f0f4f0',
          borderRadius: 8,
        }}
      >
        <VideoCameraOutlined style={{ fontSize: 36, color: '#b0b0b0' }} />
        <Button
          icon={<LinkOutlined />}
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
        >
          YouTube'da İzle
        </Button>
      </Flex>
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
