import { lazy } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import Landing from "./pages/Landing";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Explore = lazy(() => import("./pages/Explore"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const PostEditor = lazy(() => import("./pages/PostEditor"));
const Profile = lazy(() => import("./pages/Profile"));
const Author = lazy(() => import("./pages/Author"));
const NotFound = lazy(() => import("./pages/NotFound"));

function CategoryRoute() {
  const { slug } = useParams();
  return <Explore key={slug} />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="explore" element={<Explore key="all" />} />
        <Route path="c/:slug" element={<CategoryRoute />} />
        <Route path="p/:id" element={<PostDetail />} />
        <Route path="u/:id" element={<Author />} />
        <Route
          path="new"
          element={
            <ProtectedRoute>
              <PostEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="p/:id/edit"
          element={
            <ProtectedRoute>
              <PostEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="me"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
