import assign from 'assign-deep';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import Swiper from 'react-native-swiper';
import DoneButton from './components/DoneButton';
import SkipButton from './components/SkipButton';
import RenderDots from './components/Dots';

const windowsWidth = Dimensions.get('window').width;
const windowsHeight = Dimensions.get('window').height;

const defaulStyles = {
  header: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pic: {
    width: 150,
    height: 150,
  },
  info: {
    flex: 0.5,
    alignItems: 'center',
    padding: 30,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
    padding: 15,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    paddingBottom: 20,
  },
  description: {
    color: '#fff',
    fontSize: 20,
  },
  dotStyle: {
    backgroundColor: 'rgba(255,255,255,.3)',
    width: 13,
    height: 13,
    borderRadius: 7,
    margin: 7,
  },
  activeDotStyle: {
    backgroundColor: '#fff',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingBottom: 10,
  },
  dotContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContainer: {
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontFamily: 'Lato-Regular',
  },
  controllText: {
    fontSize: 21,
    fontFamily: 'Lato-Regular',
  },
  full: {
    height: 50,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  }
}

export default class AppIntro extends Component {
  parallax = new Animated.Value(0);

  constructor(props) {
    super(props);

    this.styles = StyleSheet.create(assign({}, defaulStyles, props.customStyles));
  }

  onNextBtnClick = (context) => {
    this.scrollBy(1, context);
    this.props.onNextBtnClick(context.state.index);
  }

  getTransform = (index, offset, level) => {
    const isFirstPage = index === 0;
    const statRange = isFirstPage ? 0 : windowsWidth * (index - 1);
    const endRange = isFirstPage ? windowsWidth : windowsWidth * index;
    const startOpacity = isFirstPage ? 1 : 0;
    const endOpacity = isFirstPage ? 1 : 1;
    const leftPosition = isFirstPage ? 0 : windowsWidth / 3;
    const rightPosition = isFirstPage ? -windowsWidth / 3 : 0;
    const transform = [{
      transform: [
        {
          translateX: this.parallax.interpolate({
            inputRange: [statRange, endRange],
            outputRange: [
              isFirstPage ? leftPosition : leftPosition - (offset * level),
              isFirstPage ? rightPosition + (offset * level) : rightPosition,
            ],
          }),
        }],
    }, {
      opacity: this.parallax.interpolate({
        inputRange: [statRange, endRange], outputRange: [startOpacity, endOpacity],
      }),
    }];

    return {
      transform,
    };
  }

  scrollBy = (numerOfPages, context) => {
    const state = context.state;
    const diff = (context.props.loop ? 1 : 0) + numerOfPages + context.state.index;
    let x = 0;

    if (state.dir === 'x') {
      x = diff * state.width
    }

    if (Platform.OS === 'ios') {
      context.refs.scrollView.scrollTo({ y: 0, x });
    } else {
      context.refs.scrollView.setPage(diff);
      context.onScrollEnd({
        nativeEvent: {
          position: diff,
        },
      });
    }
  }

  renderPagination = (index, total, context) => {
    let isDoneBtnShow;
    let isSkipBtnShow;
    if (index === total - 1) {
      isDoneBtnShow = true;
      isSkipBtnShow = false;
    } else {
      isDoneBtnShow = false;
      isSkipBtnShow = true;
    }

    const onSkipBtnClick = () => {
      this.scrollBy(total - 1 - index, context);
    };

    return (
      <View style={[this.styles.paginationContainer]}>
        {this.props.showSkipButton ? <SkipButton
          {...this.props}
          {...this.state}
          isSkipBtnShow={isSkipBtnShow}
          styles={this.styles}
          onSkipBtnClick={onSkipBtnClick} /> :
          <View style={this.styles.btnContainer} />
        }
        <View style={this.styles.dotContainer}>
          {this.props.showDots && RenderDots(index, total, {
            ...this.props,
            styles: this.styles
          })}
        </View>
        <DoneButton
          {...this.props}
          {...this.state}
          isDoneBtnShow={isDoneBtnShow}
          styles={this.styles}
          onNextBtnClick={this.onNextBtnClick.bind(this, context)}
          onDoneBtnClick={this.props.onDoneBtnClick}
        />
      </View>
    );
  }

  renderBasicSlidePage = (index, {
    title,
    description,
    img,
    imgStyle,
    backgroundColor,
    fontColor,
    level,
  }) => {
    const AnimatedStyle1 = this.getTransform(index, 10, level);
    const AnimatedStyle2 = this.getTransform(index, 0, level);
    const AnimatedStyle3 = this.getTransform(index, 15, level);
    const imgSource = (typeof img === 'string') ? {uri: img} : img;
    const pageView = (
      <View style={[this.styles.slide, { backgroundColor }]} showsPagination={false} key={index}>
        <Animated.View style={[this.styles.header, ...AnimatedStyle1.transform]}>
          <Image style={imgStyle} source={imgSource} />
        </Animated.View>
        <View style={this.styles.info}>
          <Animated.View style={AnimatedStyle2.transform}>
            <Text style={[this.styles.title, { color: fontColor }]}>{title}</Text>
          </Animated.View>
          <Animated.View style={AnimatedStyle3.transform}>
            <Text style={[this.styles.description, { color: fontColor }]}>{description}</Text>
          </Animated.View>
        </View>
      </View>
    );
    return pageView;
  }

  renderChild = (children, pageIndex, index) => {
    const level = children.props.level || 0;
    const { transform } = this.getTransform(pageIndex, 10, level);
    const root = children.props.children;
    let nodes = children;
    if (Array.isArray(root)) {
      nodes = root.map((node, i) => this.renderChild(node, pageIndex, `${index}_${i}`));
    }
    let animatedChild = children;
    if (level !== 0) {
      animatedChild = (
        <Animated.View key={index} style={[children.props.style, transform]}>
          {nodes}
        </Animated.View>
      );
    } else {
      animatedChild = (
        <View key={index} style={children.props.style}>
          {nodes}
        </View>
      );
    }
    return animatedChild;
  }

  shadeStatusBarColor(color, percent) {
    const first = parseInt(color.slice(1), 16);
    const black = first & 0x0000FF;
    const green = first >> 8 & 0x00FF;
    const percentage = percent < 0 ? percent * -1 : percent;
    const red = first >> 16;
    const theme = percent < 0 ? 0 : 255;
    const finalColor = (0x1000000 + (Math.round((theme - red) * percentage) + red) * 0x10000 + (Math.round((theme - green) * percentage) + green) * 0x100 + (Math.round((theme - black) * percentage) + black)).toString(16).slice(1);

    return `#${finalColor}`;
  }

  isToTintStatusBar() {
    return this.props.pageArray && this.props.pageArray.length > 0 && Platform.OS === 'android'
  }

  onScrollEvent = () => Animated.event([{ x: this.parallax }]);

  render() {
    const { pageArray, children } = this.props;
    const childrens = children && children.filter((child) => !!child);
    let pages = [];
    let androidPages = null;
    if (pageArray.length > 0) {
      pages = pageArray.map((page, i) => this.renderBasicSlidePage(i, page));
    } else {
      pages = childrens.map((children, i) => this.renderChild(children, i, i));
    }

    if (this.isToTintStatusBar()) {
      StatusBar.setBackgroundColor(this.shadeStatusBarColor(this.props.pageArray[0].backgroundColor, -0.3), false);
    }

    return (
      <View>
        {androidPages}
        <Swiper
          loop={false}
          index={this.props.defaultIndex}
          renderPagination={this.renderPagination}
          onMomentumScrollEnd={(e, state) => {
            if (this.isToTintStatusBar()) {
              StatusBar.setBackgroundColor(this.shadeStatusBarColor(this.props.pageArray[state.index].backgroundColor, -0.3), false);
            }

            this.props.onSlideChange(state.index, state.total);
          }}
          onScroll={this.onScrollEvent()}
        >
          {pages}
        </Swiper>
      </View>
    );
  }
}

AppIntro.propTypes = {
  dotColor: PropTypes.string,
  activeDotColor: PropTypes.string,
  rightTextColor: PropTypes.string,
  leftTextColor: PropTypes.string,
  onSlideChange: PropTypes.func,
  onSkipBtnClick: PropTypes.func,
  onDoneBtnClick: PropTypes.func,
  onNextBtnClick: PropTypes.func,
  pageArray: PropTypes.array,
  doneBtnLabel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  skipBtnLabel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  nextBtnLabel: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  customStyles: PropTypes.object,
  defaultIndex: PropTypes.number,
  showSkipButton: PropTypes.bool,
  showDoneButton: PropTypes.bool,
  showDots: PropTypes.bool,
};

AppIntro.defaultProps = {
  dotColor: 'rgba(255,255,255,.3)',
  activeDotColor: '#fff',
  rightTextColor: '#fff',
  leftTextColor: '#fff',
  pageArray: [],
  onSlideChange: () => {},
  onSkipBtnClick: () => {},
  onDoneBtnClick: () => {},
  onNextBtnClick: () => {},
  doneBtnLabel: 'Done',
  skipBtnLabel: 'Skip',
  nextBtnLabel: '›',
  defaultIndex: 0,
  showSkipButton: true,
  showDoneButton: true,
  showDots: true
};
