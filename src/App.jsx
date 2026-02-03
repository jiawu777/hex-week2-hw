import React,{useState} from 'react';
import axios from 'axios';
import './assets/styles.css';

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

//上傳要改
function App() {
const [formData,setFormData] = React.useState({
  username:'',
  password:''
})

const [isAuth,setIsAuth] = React.useState(false);
const [tempProduct, setTempProduct] = useState(null);
const [products, setProducts] = useState([]);



const handleInputChange = (e) => {
  const {name,value}=e.target;
setFormData((prevData)=>({
 ...prevData, // 保留原有屬性
    [name]: value, // 更新特定屬性
}))}

const onSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post(`${API_BASE}/admin/signin`,formData);
const {token,expired}=res.data;  
//把token寫入cookie
document.cookie=`hexToken=${token};expires=${new Date(expired)};`;


// 修改實體建立時所指派的預設配置
axios.defaults.headers.common['Authorization'] = token;

getProducts();
setIsAuth(true);
} catch (error) {
  console.log(error.response)
  }
} 



const checkLogin = async()=>{
  // 從 cookie 中取得 token
 const token = document.cookie.replace(
/(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/,"$1",);

if(token){
  
  // 修改實體建立時所指派的預設配置
axios.defaults.headers.common['Authorization'] = token;

try{
    const res = await axios.post(`${API_BASE}/api/user/check`)
    console.log(res.data);
  }catch(error){
    console.log(error.response);
  }
}else{
  setIsAuth(false);
}
  
}

const getProducts = async()=>{
  try{
  const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
  console.log("成功取得商品清單：",res.data);
  setProducts(res.data.products);
  }catch(error){
    console.log("無法取得商品清單：",error.response)
  }
}

 return(
  !isAuth?(
  <div className="container login">
    <h1>請先登入</h1>
<form action="submit" onSubmit={(e)=>onSubmit(e)}>
    <div className="form-floating mb-3">
      <input type="email" className="form-control" name="username" placeholder="name@example.com" value={formData.username} onChange={(e) => handleInputChange(e)}/>
      <label htmlFor="username">Username</label>
    </div>
    <div className="form-floating">
      <input type="password" className="form-control" name="password" placeholder="Password" value={formData.password} onChange={(e) => handleInputChange(e)}/>
      <label htmlFor="password">Password</label>
    </div>
          <button type="submit" className="btn btn-primary w-100 mt-3" >登入</button>
  </form>
  </div>
  ):(
     <div className="container">
            <button type="button" className="btn btn-danger" onClick={()=>{checkLogin()}}>驗證是否登入</button>
          <div className="row mt-5">
            <div className="col-md-6">
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.origin_price}</td>
                      <td>{item.price}</td>
                      <td>
                        {item.is_enabled?'已啟用':'尚未啟用'}
                      </td>
                      <td>
                        <button className="btn btn-primary" onClick={()=>{
                           setTempProduct(item);
                           console.log(item)}}>查看細節</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2>單一產品細節</h2>
              {tempProduct ? (
                <div className="card mb-3">
                  <img src={tempProduct?.imageUrl} className="card-img-top primary-image" alt="主圖" />
                  <div className="card-body">
                    <h5 className="card-title">
                      <span className="badge bg-primary ms-2">{tempProduct?.title}</span>
                    </h5>
                    <p className="card-text">商品描述：{tempProduct?.description}</p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <p className="card-text text-secondary"><del>{tempProduct?.origin_price}</del></p>
                      元 / {tempProduct?.price} 元
                    </div>
                    <h5 className="mt-3">更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct?.imagesUrl.map((imgUrl,index) => 
                      (<img src={imgUrl} key={index}className="card-img-top secondary-image" alt="更多圖片" />)
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      )
  )
}

export default App;