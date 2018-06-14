import ControllerUnit from 'components/ControllerUnit';

require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

var imageDatas = require('../data/imagesData');


// 利用自执行函数，将图片信息转换成图片URL路径信息
imageDatas = (function genImageURL(imageDataArr) {
  // console.log(imageDataArr);
  for (var i = 0, j = imageDataArr.length; i < j; i++){
    var singleImageData = imageDataArr[i];
    singleImageData.imageURL = require('../images/' + singleImageData.fileName);
    imageDataArr[i] = singleImageData;
  }
  return imageDataArr;
})(imageDatas);

/*
* 获取区间内的一个随机值
 */
function getRangeRand(low,high) {
  return Math.ceil(Math.random()*(high-low)+low)
}

/*
* 获取 0~30° 之间的一个任意正负值
*/
function get30DegRandom() {
  return ((Math.random()>0.5?'':'-')+Math.ceil(Math.random()*35));
}

class ImgFigure extends React.Component{
  constructor(props){
    super(props);
    // console.log(this.props);
    this.state=this.props;
  }

  /*
  * imgFigure的点击处理函数
   */
  handleClick(event){
    if(this.props.arrange.isCenter){
      this.props.inverse();

    }else {
      this.props.center();
    }


    event.stopPropagation();
    event.preventDefault();
    console.log(this.props.arrange);
  }


  render(){

    // console.log(this.props.arrange);

    var styleObj={};

    // 如果props属性中制定了这张图片的位置，则使用
    if(this.props.arrange.pos){
      styleObj=this.props.arrange.pos;
    }
    if(this.props.arrange.isCenter){
      styleObj.zIndex=11;
    }

    //如果图片的旋转角度有值并且不为0，添加旋转角度
    if(this.props.arrange.rotate){
      (['Moz','ms','Webkit','']).forEach(function (value) {
        styleObj[value+'Transform']='rotate('+this.props.arrange.rotate+'deg)';

      }.bind(this));
    }

    var imgFigureClassName="img-figure";
    imgFigureClassName+= this.props.arrange.isInverse?" is-inverse":'';

    return (
      <figure className={imgFigureClassName} style={styleObj}  onClick={this.handleClick.bind(this)} >
        <img src={this.props.data.imageURL} alt={this.props.data.title}></img>
        <figcaption>
          <h2 className="img-title">{this.props.data.title}</h2>
        </figcaption>
        <div className="img-back">
          <p>{this.props.data.desc}</p>
        </div>
      </figure>
    )
  }
}

class AppComponent extends React.Component {
  constructor(props){
    super(props);
    let imgsArrangeArr=[];
    imageDatas.forEach(function (value,index) {
      if (!imgsArrangeArr[index]) {
        imgsArrangeArr[index] = {
          pos: {
            left: 0,
            top: 0
          },
          rotate: 0,
          isInverse:false,    //图片正反面，false是正面，true是反面
          isCenter:false
        };
        // console.log(index,"img is false")
      }
    });
    this.state={
      imgsArrangeArr,
      Constant:{
        centerPos:{
          left: 0,
          top: 0
        },
        hPosRange:{
          // 水平方向的取值范围
          leftSecX:[0,0],
          rightSecX:[0,0],
          y:[0,0]
        },
        vPosRange:{
          // 垂直方向取值范围
          x:[0,0],
          topY:[0,0]
        }
      }
    }
  }


  /*
  * 翻转图片
  * @param index 输入当前被执行inverse操作的图片对应的图片信息数组的index值
  * @return {Function} 这是一个闭包函数，其内return一个真正待被执行的函数
   */
  inverse(index){
    return function () {
      console.log(this.state)
      var imgsArrangeArr=this.state.imgsArrangeArr;
      imgsArrangeArr[index].isInverse=!imgsArrangeArr[index].isInverse;
      this.setState({
        imgsArrangeArr:imgsArrangeArr
      })
    }.bind(this);
  }

  /*
    * 重新布局所有的图片
    * @param centerIndex 指定居中排布哪个图片

   */
  rearrange(centerIndex){
    var imgsArrangeArr=this.state.imgsArrangeArr,
      Constant =this.state.Constant,
      centerPos=Constant.centerPos,
      hPosRange=Constant.hPosRange,
      vPosRange=Constant.vPosRange,
      hPosRangeLeftSecX=hPosRange.leftSecX,
      hPosRangeRightSecX=hPosRange.rightSecX,
      hPosRangeY=hPosRange.y,
      vPosRangeTopY=vPosRange.topY,
      vPosRangeX=vPosRange.x,

      imgsArrangeTopArr=[],
      //取一个，或者不取
      topImgNum=Math.ceil(Math.random()*1),
      topImgSpliceIndex=0,

      imgsArrangeCenterArr=imgsArrangeArr.splice(centerIndex,1);

    //首先居中centerIndex的图片
    // imgsArrangeCenterArr[0].pos=centerPos;

    //居中的centerIndex的图片不需要旋转
    // imgsArrangeCenterArr[0].rotate=0;
    imgsArrangeCenterArr[0]={
      pos:centerPos,
      rotate:0,
      isCenter:true
    }



    //取出要布局上侧的图片状态信息
    topImgSpliceIndex=Math.ceil(Math.random()*imgsArrangeArr.length-topImgNum);
    imgsArrangeTopArr=imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);

     //布局位于上侧的图片
    imgsArrangeTopArr.forEach(function (value,index) {
      imgsArrangeTopArr[index]={
        pos:{
          top:getRangeRand(vPosRangeTopY[0],vPosRangeTopY[1]),
          left:getRangeRand(vPosRangeX[0],vPosRangeX[1])
        },
        rotate:get30DegRandom(),
        isCenter:false
      };
    });

    //布局左右两侧的图片
    for(var i=0,j=imgsArrangeArr.length,k=j/2;i<j;i++){
      var hPosRangeLORX=null;

      // 前半部分布局在左边，右半部分布局在右边
      if(i<k){
        hPosRangeLORX=hPosRangeLeftSecX
      }else {
        hPosRangeLORX=hPosRangeRightSecX
      }
      imgsArrangeArr[i]={
        pos:{
          top:getRangeRand(hPosRangeY[0],hPosRangeY[1]),
          left:getRangeRand(hPosRangeLORX[0],hPosRangeLORX[1])
        },
        rotate:get30DegRandom(),
        isCenter:false

      }
    }




    if(imgsArrangeTopArr&&imgsArrangeTopArr[0]){
      imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0])
    }
    imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr[0])

    imageDatas.forEach(function (value,index) {
      if (!imgsArrangeArr[index]) {
        imgsArrangeArr[index] = {
          pos: {
            left: 0,
            top: 0
          },
          rotate: 0,
          isInverse:false,    //图片正反面，false是正面，true是反面
          isCenter:false
        }
        console.log(index,"img is false")
      }
    });

    // debugger;

    this.setState({
      imgsArrangeArr:imgsArrangeArr
    },()=>{
      //setState属于异步回调，修改后的值需要在回掉函数中调用才能使用，不然获取到的值是初始值
      console.log(imgsArrangeArr);
    })
  }



  /*
    * 利用rearrange函数，居中对应index的图片
    * @param index，需要被居中的图片对应的图片信息数组的index值
    * @return {Function}
   */
  center(index){
    return function () {
      this.rearrange(index);
    }.bind(this)
  }



  // 组件加载以后，为每张图片计算其位置的范围
  componentDidMount(){
    // 首先拿到舞台的大小
    var stageDOM=this.refs.stage,
      stageW=stageDOM.scrollWidth,
      stageH=stageDOM.scrollHeight,
      halfStageW=Math.ceil(stageW/2),
      halfStageH=Math.ceil(stageH/2);

    // 拿到一个imageFigure的大小
    var imgFigureDOM=ReactDOM.findDOMNode(this.refs.imgFigure0),
      imgW=imgFigureDOM.scrollWidth,
      imgH=imgFigureDOM.scrollHeight,
      halfImgW=Math.ceil(imgW/2),
      halfImgH=Math.ceil(imgH/2);
      // console.log(imgW,imgH,halfImgW,halfImgH);

      // console.log(left)
    // 计算中心图片的位置点
    this.setState({
      Constant:{
        centerPos:{
          left: halfStageW-halfImgW,
          top: halfStageH-halfImgH
        },
        hPosRange:{
          // 水平方向的取值范围
          leftSecX:[halfImgW,halfStageW-halfImgW*3],
          rightSecX:[halfStageW+halfImgW,stageW-halfImgW],
          y:[-halfImgH,stageH-halfImgW]
        },
        vPosRange:{
          // 垂直方向取值范围
          x:[halfImgW-imgW,halfImgW],
          topY:[-halfImgH,halfStageH-halfImgH*3]
        }
      }
    },()=>{
      this.rearrange(0);
    })




    // this.Constant.centerPos.left=halfStageW-halfImgW;
    // this.Constant.centerPos.right=halfStageH-halfImgH;
    //
    // //计算左侧，右侧区域图片排布位置的取值范围
    // this.Constant.hPosRange.leftSecX[0]=-halfImgW;
    // this.Constant.hPosRange.leftSecX[1]=halfStageW-halfImgW*3;
    // this.Constant.hPosRange.rightSecX[0]=halfStageW+halfImgW;
    // this.Constant.hPosRange.rightSecX[1]=stageW-halfImgW;
    // this.Constant.hPosRange.y[0]=-halfImgH;
    // this.Constant.hPosRange.y[1]=stageH-halfImgW;
    //
    // //计算上侧区域图片排布位置的取值范围
    // this.Constant.vPosRange.topY[0]=-halfImgH;
    // this.Constant.vPosRange.topY[1]=halfStageH-halfImgH*3;
    // this.Constant.vPosRange.x[0]=halfImgW-imgW;
    // this.Constant.vPosRange.x[1]=halfImgW;

  }

  render() {
    var controllerUnits=[],   //控制点
      imgFigures=[]; //存放单个图片组件，数组

    imageDatas.forEach(function (value,index) {
      // if(!this.state.imgsArrangeArr[index]){
      //   this.state.imgsArrangeArr[index]={
      //     pos:{
      //       left:'0',
      //       top:'0'
      //     },
      //     rotate:0
      //   }
      // }
      imgFigures.push(<ImgFigure data={value} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)} index={index} key={index} ref={'imgFigure'+index}/>)
      controllerUnits.push(<ControllerUnit key={'units'+index} arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)} />)
    }.bind(this))

    return (
      <section className="stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
