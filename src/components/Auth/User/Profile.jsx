import React, { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { fetchUserInfo } from '../../Auth/utils/auth';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    // State for personal info form
    const [personalInfo, setPersonalInfo] = useState({
        name: '',
        email: '',
        avatar: null,
    });

    // State for password form
    const [passwordInfo, setPasswordInfo] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // State for user info and loading/error
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Fetch user info on mount
    useEffect(() => {
        const fetchData = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setError('Vui lòng đăng nhập để xem thông tin tài khoản.');
                navigate('/login');
                return;
            }

            try {
                const userData = await fetchUserInfo();
                const userInfo = {
                    id: userData.id || localStorage.getItem('userId') || 'unknown',
                    name: userData.name || localStorage.getItem('userName') || 'Người dùng',
                    email: userData.email || localStorage.getItem('userEmail') || 'unknown',
                    avatarUrl: userData.avatarUrl || null,
                };
                setUser(userInfo);
                setPersonalInfo({
                    name: userInfo.name,
                    email: userInfo.email,
                    avatar: null,
                });
            } catch (err) {
                console.error('[Profile] Error fetching user info:', {
                    message: err.message,
                    response: err.response ? { status: err.response.status, data: err.response.data } : 'No response',
                });
                setError('Không thể tải thông tin tài khoản. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // Handle personal info form changes
    const handlePersonalInfoChange = (e) => {
        const { name, value } = e.target;
        setPersonalInfo((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle avatar file change
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPersonalInfo((prev) => ({
                ...prev,
                avatar: file,
            }));
        }
    };

    // Handle password form changes
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordInfo((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle personal info form submission
    const handlePersonalInfoSubmit = async (e) => {
        e.preventDefault();
        if (!user || user.id === 'unknown') {
            alert('Không thể xác định ID người dùng. Vui lòng đăng nhập lại.');
            navigate('/login');
            return;
        }

        try {
            const accessToken = localStorage.getItem('accessToken');
            const formData = new FormData();
            formData.append('user', JSON.stringify({ name: personalInfo.name, email: personalInfo.email }));
            if (personalInfo.avatar) {
                formData.append('avatar', personalInfo.avatar);
            }

            const response = await fetch(`http://localhost:8080/api/v1/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Lỗi khi cập nhật thông tin');
            }

            const updatedUser = await response.json();
            // Update local storage with new user info
            localStorage.setItem('userName', updatedUser.name);
            localStorage.setItem('userEmail', updatedUser.email);
            setUser(updatedUser);
            alert('Cập nhật thông tin thành công!');
        } catch (err) {
            alert('Lỗi khi cập nhật thông tin: ' + err.message);
        }
    };

    // Handle password form submission
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
            alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
            return;
        }
        console.log('Password Info Submitted:', passwordInfo);
        // Add API call to update password here
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#18191c] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#18191c] flex items-center justify-center">
                <p className="text-red-500 text-lg">{error}</p>
            </div>
        );
    }

    // Get user initials for avatar placeholder
    const getInitials = (name) => {
        if (!name) return 'TL';
        const nameParts = name.split(' ').filter(Boolean);
        if (nameParts.length === 0) return 'TL';
        if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
        return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
    };

    return (
        <div className="bg-[#18191c] text-white font-sans min-h-screen flex justify-center p-6">
            <main className="max-w-4xl w-full">
                <h1 className="flex items-center justify-center gap-2 text-white text-lg font-semibold mb-8">
                    <FaUserCircle className="text-white text-lg" />
                    <span>Thông tin tài khoản</span>
                </h1>

                {/* Personal Info Section */}
                <section className="flex flex-col md:flex-row gap-6 border-b border-gray-600 pb-8 mb-8">
                    <div className="md:w-1/4 text-xs leading-tight">
                        <h2 className="font-semibold mb-1">Thông tin cá nhân</h2>
                        <p className="text-gray-300">
                            Cập nhật thông tin hồ sơ tài khoản và địa chỉ email của bạn.
                        </p>
                    </div>
                    <form
                        className="md:w-3/4 bg-[#222327] rounded-md p-6 space-y-4"
                        autoComplete="off"
                        onSubmit={handlePersonalInfoSubmit}
                    >
                        <div>
                            <label className="block text-xs mb-1" htmlFor="avatar">
                                Ảnh
                            </label>
                            <div className="flex items-center gap-4 mb-2">
                                {user.avatarUrl ? (
                                    <img
                                        src={`http://localhost:8080${user.avatarUrl}`}
                                        alt="User avatar"
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div
                                        className="w-12 h-12 rounded-full bg-[#d9d9f7] flex items-center justify-center text-[#6a6af7] font-semibold text-lg select-none"
                                        aria-label={`User initials ${getInitials(personalInfo.name)}`}
                                    >
                                        {getInitials(personalInfo.name)}
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                id="avatar"
                                name="avatar"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="avatar"
                                className="text-[9px] border border-white rounded px-2 py-[2px] uppercase tracking-widest hover:bg-white hover:text-black transition cursor-pointer"
                            >
                                Chọn một ảnh mới
                            </label>
                        </div>

                        <div>
                            <label className="block text-xs mb-1" htmlFor="name">
                                Tên
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={personalInfo.name}
                                onChange={handlePersonalInfoChange}
                                className="w-full rounded border border-gray-600 bg-transparent px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs mb-1" htmlFor="email">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={personalInfo.email}
                                onChange={handlePersonalInfoChange}
                                className="w-full rounded border border-gray-600 bg-transparent px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="text-[9px] border border-white rounded px-3 py-[2px] uppercase tracking-widest hover:bg-white hover:text-black transition"
                            >
                                Lưu
                            </button>
                        </div>
                    </form>
                </section>

                {/* Password Update Section */}
                <section className="flex flex-col md:flex-row gap-6 border-b border-gray-600 pb-8 mb-8">
                    <div className="md:w-1/4 text-xs leading-tight">
                        <h2 className="font-semibold mb-1">Cập nhật mật khẩu</h2>
                        <p className="text-gray-300">
                            Đảm bảo tài khoản của bạn đang sử dụng mật khẩu dài, ngẫu nhiên để giữ an toàn.
                        </p>
                    </div>
                    <form
                        className="md:w-3/4 bg-[#222327] rounded-md p-6 space-y-4"
                        autoComplete="off"
                        onSubmit={handlePasswordSubmit}
                    >
                        <div>
                            <label className="block text-xs mb-1" htmlFor="current-password">
                                Mật khẩu hiện tại
                            </label>
                            <input
                                id="current-password"
                                name="currentPassword"
                                type="password"
                                value={passwordInfo.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full rounded border border-gray-600 bg-transparent px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs mb-1" htmlFor="new-password">
                                Mật khẩu mới
                            </label>
                            <input
                                id="new-password"
                                name="newPassword"
                                type="password"
                                value={passwordInfo.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full rounded border border-gray-600 bg-transparent px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs mb-1" htmlFor="confirm-password">
                                Xác Nhận Mật Khẩu
                            </label>
                            <input
                                id="confirm-password"
                                name="confirmPassword"
                                type="password"
                                value={passwordInfo.confirmPassword}
                                onChange={handlePasswordChange}
                                className="w-full rounded border border-gray-600 bg-transparent px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="text-[9px] border border-white rounded px-3 py-[2px] uppercase tracking-widest hover:bg-white hover:text-black transition"
                            >
                                Lưu
                            </button>
                        </div>
                    </form>
                </section>
                <section className="flex flex-col md:flex-row gap-6 border-b border-gray-600 pb-8 mb-8">
                    <div className="md:w-1/4 text-xs leading-tight">
                        <h2 className="font-semibold mb-1">Phiên làm việc Trình duyệt</h2>
                        <p className="text-gray-300">
                            Quản lý và đăng xuất khỏi các phiên hoạt động của bạn trên các trình duyệt và thiết bị khác.
                        </p>
                    </div>
                    <form
                        className="md:w-3/4 bg-[#222327] rounded-md p-6 space-y-4"
                        autoComplete="off"
                        onSubmit={handlePersonalInfoSubmit}
                    > 
                    <p className="text-gray-300 mb-4">
                            Nếu cần, bạn có thể đăng xuất khỏi tất cả các phiên trình duyệt khác trên tất cả các thiết bị của mình. Một số phiên gần đây của bạn được liệt kê bên dưới; tuy nhiên, danh sách này có thể không đầy đủ. Nếu bạn cảm thấy tài khoản của mình đã bị xâm phạm, bạn cũng nên cập nhật mật khẩu của mình.
                        </p>

                        <input
                            type="file"
                            id="avatar"
                            name="avatar"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                        <label
                            htmlFor="avatar"
                            className=" text-[18px] border border-white rounded px-10 py-[2px] uppercase tracking-widest hover:bg-white hover:text-black transition cursor-pointer"
                        >
                           Đăng Xuất
                        </label>



                    </form>
                </section>
            </main>
        </div>
    );
};

export default Profile;