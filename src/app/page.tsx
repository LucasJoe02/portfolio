import PostList from "@/components/PostList";

const items = [
  { id: 1, title: 'Boids', description: '', img: '/back_v2.png', path: '/boids'},
  { id: 2, title: 'Ray Tracer', description: '', img: '/raytracer_pixel.png', path: '/raytracer' },
  { id: 3, title: '*Coming Soon*', description: '', img: '/yellow.jpg', path: '/' },
];

export default function Page() {
  return (
    <>
      <h1>Lucas Redding</h1>
      <PostList items={items} />
    </>
  )
}