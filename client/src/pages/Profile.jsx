import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,

} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import back11 from '/bg3.jpg';
import cardBack from '/blogo2.png';



export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();
 

  // firebase storage
  // allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 * 1024 &&
  // request.resource.contentType.matches('image/.*')

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      // eslint-disable-next-line no-unused-vars
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };


 
  

  return (
    <div className='min-h-screen  flex justify-center items-center 'style={{ backgroundImage: `url(${back11})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className='p-6   mt-16 w-full max-w-[500px] mx-auto rounded-xl shadow-xl shadow-xl bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-0'>
        <h1 className='text-3xl font-semibold text-center my-2 text-white'>Profile</h1>
  
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 px-10'>
          <input
            onChange={(e) => setFile(e.target.files[0])}
            type='file'
            ref={fileRef}
            hidden
            accept='image/*'
          />
          <img
            onClick={() => fileRef.current.click()}
            src={formData.avatar || currentUser.avatar}
            alt='profile'
            className='rounded-2xl h-24 w-24 object-cover cursor-pointer self-center mt-2  '
          />
          <p className='text-sm self-center text-white'>
            {fileUploadError ? (
              <span className='text-red-700'>
                Error Image upload (image must be less than 2 mb)
              </span>
            ) : filePerc > 0 && filePerc < 100 ? (
              <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
            ) : filePerc === 100 ? (
              <span className='text-blue-200'>Image successfully uploaded!</span>
            ) : (
              ''
            )}
          </p>
          <input
            type='text'
            placeholder='username'
            defaultValue={currentUser.username}
            id='username'
            className='border p-2 rounded-lg focus:outline-none bg-[#7291d1]'
            onChange={handleChange}
          />
          <input
            type='email'
            placeholder='email'
            id='email'
            defaultValue={currentUser.email}
            className='border p-2 rounded-lg  focus:outline-none bg-[#7291d1]'
            onChange={handleChange}
          />
          
          <button
            disabled={loading}
            className='bg-[#1a3463] text-lg hover:bg-[#18346e] text-[#dee2f0] rounded-lg p-2 uppercase hover:opacity-95 disabled:opacity-80'
          >
            {loading ? 'Loading...' : 'Update'}
          </button>
       
        </form>
        <div className='flex justify-between mt-5'>
          <span
            onClick={handleDeleteUser}
            className='text-white text-slate-600 cursor-pointer'
          >
            Delete account
          </span>
       
        </div>
  
        <p className='text-red-700 mt-5'>{error ? error : ''}</p>
        <p className='text-blue-400 mt-5'>
          {updateSuccess ? 'User is updated successfully!' : ''}
        </p>
       </div>
        </div>
    );
  
  
}