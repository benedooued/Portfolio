import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import BlogPage from "../pages/BlogPage";
import PostPage from "../pages/PostPage";
import LoginPage from "../pages/LoginPage";
import AdminDashboard from "../pages/AdminDashboard";
import ProtectedRoute from "../components/ProtectedRoute";
import CreatePostPage from "../pages/CreatePostPage";
import EditPostPage from "../pages/EditPostPage";
import AdminCommentsPage from "../pages/AdminCommentsPage";
import MainLayout from "../components/layout/MainLayout";
import AdminLayout from "../components/layout/AdminLayout";
import NotFoundPage from "../pages/NotFoundPage";

export default function AppRouter() {
    return (
        <BrowserRouter>
           
            <Routes>
                <Route element={<MainLayout />}>
                    <Route
                    path="/"
                    element={<HomePage />}
                    />

                    <Route
                    path="/blog"
                    element={<BlogPage />}
                    />

                    <Route
                    path="/blog/:slug"
                    element={<PostPage />}
                    />
                </Route>

                <Route
                    path="/admin/login"
                    element={<LoginPage />}
                />

                <Route
                    path="*"
                    element={<NotFoundPage />}
                />

                <Route element={<ProtectedRoute />}>
                    <Route element={<AdminLayout />}>
                        <Route
                            path="/admin"
                            element={<AdminDashboard />}
                        />

                        <Route
                            path="/admin/posts/new"
                            element={<CreatePostPage />}
                        />

                        <Route
                            path="/admin/posts/:id/edit"
                            element={<EditPostPage />}
                        />

                        <Route
                            path="/admin/comments"
                            element={<AdminCommentsPage />}
                        />
                    </Route>
                </Route>
            </Routes>


            
        </BrowserRouter>
    );
}